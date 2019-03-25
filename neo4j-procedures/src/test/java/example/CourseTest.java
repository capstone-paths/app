package example;

import org.junit.*;
import org.neo4j.driver.v1.*;
import org.neo4j.harness.junit.Neo4jRule;

import static org.hamcrest.core.IsEqual.equalTo;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertThat;
import static org.hamcrest.collection.IsIterableContainingInAnyOrder.containsInAnyOrder;
import static org.junit.Assert.assertTrue;

import java.net.URL;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
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

    String baseWorkingQuery = "MATCH (c: Course) WHERE c.name='Machine Learning' "
            +  "CALL example.findCoursePath(c, 0, {}) "
            +  "YIELD nodes, relationships "
            +  "RETURN nodes, relationships";

    @Test
    public void shouldReturnSingleNode() throws Throwable
    {
        URL url = this.getClass().getResource("small-test-000");
        String init = new String(Files.readAllBytes(Paths.get(url.toURI()))).trim();

        Long nodeId = session.run(init).single().get(0).asNode().id();

        List<Record> result = session.run(baseWorkingQuery).list();
        Value val = result.get(0).get(0);

        assertThat( val.get(0).asNode().id(), equalTo(nodeId) );
    }


    @Test
    public void shouldReturnTwoNodesAndOneLink() throws Throwable
    {
        setDBInitStateFromFile("small-test-001");

        Record record = session.run(baseWorkingQuery).list().get(0);
        Value nodes = record.get("nodes");
        Value rels = record.get("relationships");

        assertEquals(2, nodes.size());
        assertEquals(1, rels.size());

        String[] expected = {
                "Algorithms -> Machine Learning"
        };

        courseAndPrereqTester(nodes, rels, expected);
    }

    @Test
    public void shouldHandleThreeNodeCycle() throws Throwable
    {
        setDBInitStateFromFile("small-test-002");

        Record record = session.run(baseWorkingQuery).list().get(0);
        Value nodes = record.get("nodes");
        Value rels = record.get("relationships");

        assertEquals(3, nodes.size());
        assertEquals(2, rels.size());

        String[] expected = {
                "Algorithms -> Machine Learning",
                "Probability -> Algorithms"
        };

        courseAndPrereqTester(nodes, rels, expected);
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


    private void courseAndPrereqTester(Value courseNodes, Value prereqNodes, String[] expected)
    {
        HashMap<Long, String> map = new HashMap<>();
        for(Value course : courseNodes.values()) {
            Long id = course.asNode().id();
            map.put(id, course.get("name").asString());
        }

        ArrayList<String> list = new ArrayList<>();
        for (Value prereq : prereqNodes.values()) {
            String startCourseName = map.get(prereq.asRelationship().startNodeId());
            String endCourseName = map.get(prereq.asRelationship().endNodeId());
            list.add(startCourseName + " -> " + endCourseName);
        }

        for (String tuple : expected) {
            assertTrue(list.contains(tuple));
//            assertThat(list, containsInAnyOrder(tuple));
        }
    }
}
