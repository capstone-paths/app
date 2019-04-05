package lernt;

import org.junit.*;
import org.neo4j.driver.v1.*;
import org.neo4j.harness.junit.Neo4jRule;

import static org.hamcrest.core.IsEqual.equalTo;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertThat;
import static org.hamcrest.collection.IsIterableContainingInAnyOrder.containsInAnyOrder;
import static org.junit.Assert.assertTrue;

import java.io.FileReader;
import java.io.LineNumberReader;
import java.net.URL;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;


public class CourseTest
{
    // Shut up the server logger, it produces a lot of noise
    private final static Logger COM_SUN_JERSEY_LOGGER = Logger.getLogger( "com.sun.jersey" );
    static {
        COM_SUN_JERSEY_LOGGER.setLevel( Level.SEVERE );
    }

    @Rule
    public Neo4jRule neo4j = new Neo4jRule().withProcedure( CoursePath.class );

    private Driver driver;
    private Session session;

    @Before
    public void setUp() {
        driver = GraphDatabase.driver( neo4j.boltURI(), Config.build()
                .withLogging(Logging.console(Level.SEVERE))
                .withEncryptionLevel(Config.EncryptionLevel.NONE)
                .toConfig());
        session = driver.session();
    }

    @After
    public void tearDown() {
        session.close();
        driver.close();
    }

    String baseWorkingQuery = "MATCH (t: Track) WHERE t.name='Track: Machine Learning' "
            +  "CALL lernt.findCoursePath(t, 0, {}) "
            +  "YIELD nodes, relationships "
            +  "RETURN nodes, relationships";


    @Test
    public void shouldReturnSingleNode() throws Throwable
    {
        setDBInitStateFromFile("bm-000");
        processRelationshipsFile("bm-000-test-single-node");

        int expectedNodes = 3;
        int expectedRels = 2;

        String[] expectedValues = {
                "VirtualPathStart -> CS50x",
                "CS50x -> Track: Machine Learning"
        };

        courseAndPrereqTester(baseWorkingQuery, expectedNodes, expectedRels, expectedValues);
    }


    @Test
    public void shouldHandleSimpleCycle() throws Throwable
    {
        setDBInitStateFromFile("bm-000");
        processRelationshipsFile("bm-000-test-cycle-simple");

        int expectedNodes = 4;
        int expectedRels = 3;

        String[] expectedValues = {
                "VirtualPathStart -> CS50x",
                "VirtualPathStart -> Algorithms",
                "Algorithms -> Track: Machine Learning",
                "CS50x -> Track: Machine Learning"
        };

        courseAndPrereqTester(baseWorkingQuery, expectedNodes, expectedRels, expectedValues);
    }


    @Test
    public void shouldHandleComplexCycles() throws Throwable
    {

    }


    @Test
    public void shouldHandleThreeNodesWithCommonPrereqs() throws Throwable
    {
        setDBInitStateFromFile("small-test-003");

        Record record = session.run(baseWorkingQuery).list().get(0);
        Value nodes = record.get("nodes");
        Value rels = record.get("relationships");

        assertEquals(3, nodes.size());
        assertEquals(2, rels.size());

        String[] expected = {
                "Algorithms -> Machine Learning",
                "Probability -> Machine Learning"
        };

        courseAndPrereqTester(nodes, rels, expected);
    }


    private void setDBInitStateFromFile(String filename) throws Throwable
    {
        URL url = this.getClass().getResource(filename);
        String init = new String(Files.readAllBytes(Paths.get(url.toURI()))).trim();
        session.run(init);
    }

    /**
     * Parses a relationship file line by line and creates the necessary relationships
     * @param filename The file with the relationship data
     */
    private void processRelationshipsFile(String filename) throws Throwable
    {

        LineNumberReader lr = new LineNumberReader(new FileReader(filename));
        String line;
        String trimmed;
        while ((line = lr.readLine()) != null)
        {
            if (line.isEmpty()) { continue; }

            trimmed = line.trim();

            if (line.startsWith("//")) { continue; }

            String[] parts = line.split(", | ");
            if (parts.length != 6) {
                throw new Exception("Invalid line: " + trimmed);
            }
            createRelationships(line);
        }

    }

    private void createRelationships(String[] parts) throws Throwable
    {
        Map<String, Object> params = new HashMap<String, Object>();
        params.put("sourceLabel", parts[0]);
        params.put("sourceID", parts[1]);
        params.put("relLabel", parts[2]);
        params.put("targetLabel", parts[3]);
        params.put("targetID", parts[4]);

        // https://stackoverflow.com/q/24274364/6854595
        String query = "CREATE (#sourceLabel# {id: {sourceID})-[#relLabel#]->(#targetLabel# {id: {targetID}})";
        for (String key: params.keySet()) {
            query = query.replaceAll("#" + key + "#", String.valueOf(params.get(key)));
        }

        int reps = Integer.valueOf(parts[5]);

        for (int i = 0; i < reps; i++) {
            session.run(query, params);
        }
    }


    private void courseAndPrereqTester(String query, int expectedNode, int expectedRels, String[] expectedValues)
    {
        Record record = session.run(query).list().get(0);
        Value nodes = record.get("nodes");
        Value rels = record.get("relationships");

        assertEquals(expectedNode, nodes.size());
        assertEquals(expectedRels, rels.size());

        HashMap<Long, String> map = new HashMap<>();
        for(Value course : nodes.values()) {
            Long id = course.asNode().id();
            map.put(id, course.get("name").asString());
        }

        ArrayList<String> list = new ArrayList<>();
        for (Value prereq : rels.values()) {
            String startCourseName = map.get(prereq.asRelationship().startNodeId());
            String endCourseName = map.get(prereq.asRelationship().endNodeId());
            list.add(startCourseName + " -> " + endCourseName);
        }

        for (String tuple : expectedValues) {
            assertTrue(list.contains(tuple));
        }
    }
}
