package lernt;

import org.junit.*;
import org.neo4j.driver.v1.*;
import org.neo4j.driver.v1.summary.ResultSummary;
import org.neo4j.driver.v1.summary.SummaryCounters;
import org.neo4j.harness.junit.Neo4jRule;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertThat;
import static org.junit.Assert.assertTrue;

import java.io.File;
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
            +  "CALL lernt.findCoursePath(t, { trackIDPropName: 'id', courseIDPropName: 'id' }) "
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
                "Start -> CS50x",
                "CS50x -> Track: Machine Learning"
        };

        courseAndPrereqTester(baseWorkingQuery, expectedNodes, expectedRels, expectedValues);
    }



    @Test
    public void shouldNotRecommendSimilarCourses() throws Throwable
    {
        setDBInitStateFromFile("bm-000");
        processRelationshipsFile("bm-000-test-similar");

        int expectedNodes = 3;
        int expectedRels = 2;

        String[] expectedValues = {
                "Start -> Algorithms",
                "Algorithms -> Track: Machine Learning"
        };

        courseAndPrereqTester(baseWorkingQuery, expectedNodes, expectedRels, expectedValues);
    }


    @Test
    public void shouldNotRecommendCoursesUserHasTaken() throws Throwable
    {
        setDBInitStateFromFile("bm-000");
        processRelationshipsFile("bm-000-test-user");

        String query = "MATCH (t: Track) WHERE t.name='Track: Machine Learning' "
                +  "CALL lernt.findCoursePath(t, {userID: '1', userIDPropName: 'id', trackIDPropName: 'id', courseIDPropName: 'id'}) "
                +  "YIELD nodes, relationships "
                +  "RETURN nodes, relationships";

        List<Record> record = session.run(query).list();
        assertEquals(0, record.size());
    }


    @Test
    public void shouldHandleSimplestCycle() throws Throwable
    {
        setDBInitStateFromFile("bm-000");
        processRelationshipsFile("bm-000-test-cycle-simplest");

        int expectedNodes = 3;
        int expectedRels = 2;

        String[] expectedValues = {
                "Start -> CS50x",
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
        int expectedRels = 4;

        String[] expectedValues = {
                "Algorithms -> Track: Machine Learning",
                "CS50x -> Track: Machine Learning"
        };

        courseAndPrereqTester(baseWorkingQuery, expectedNodes, expectedRels, expectedValues);
    }


    @Test
    public void shouldHandleCommonPrereqsA() throws Throwable
    {
        setDBInitStateFromFile("bm-000");
        processRelationshipsFile("bm-000-test-common-a");

        String[] expectedValues = {
                "Start -> CS50x",
                "CS50x -> Algorithms",
                "CS50x -> Probability",
                "Algorithms -> Probability",
                "Probability -> Track: Machine Learning"
        };

        int expectedNodes = 5;
        int expectedRels = 5;

        courseAndPrereqTester(baseWorkingQuery, expectedNodes, expectedRels, expectedValues);
    }


    @Test
    public void shouldHandleCommonPrereqsB() throws Throwable
    {
        setDBInitStateFromFile("bm-000");
        processRelationshipsFile("bm-000-test-common-b");

        String[] expectedValues = {
                "Start -> Algorithms",
                "Algorithms -> CS50x",
                "CS50x -> Probability",
                "Algorithms -> Probability",
                "Probability -> Track: Machine Learning"
        };

        int expectedNodes = 5;
        int expectedRels = 5;

        courseAndPrereqTester(baseWorkingQuery, expectedNodes, expectedRels, expectedValues);
    }


    @Test
    public void shouldHandleThreeWayClockwiseCycle() throws Throwable
    {
        setDBInitStateFromFile("bm-000");
        processRelationshipsFile("bm-000-test-cycle-three-clockwise");

        String[] expectedValues = {
//                "Start -> CS50x",
                "CS50x -> Algorithms",
                "Algorithms -> Probability",
                "Probability -> Track: Machine Learning"
        };

        int expectedNodes = 5;
        int expectedRels = 4;

        courseAndPrereqTester(baseWorkingQuery, expectedNodes, expectedRels, expectedValues);
    }


    @Test
    public void shouldHandleThreeWayCounterCycle() throws Throwable
    {
        setDBInitStateFromFile("bm-000");
        processRelationshipsFile("bm-000-test-cycle-three-counter");

        String[] expectedValues = {
//                "Start -> Algorithms",
                "Algorithms -> CS50x",
                "CS50x -> Probability",
                "Probability -> Track: Machine Learning"
        };

        int expectedNodes = 5;
        int expectedRels = 4;

        courseAndPrereqTester(baseWorkingQuery, expectedNodes, expectedRels, expectedValues);
    }

    @Test
    public void shouldHandleThreeWayComplexCycle() throws Throwable
    {
        setDBInitStateFromFile("bm-000");
        processRelationshipsFile("bm-000-test-cycle-three-complex");

        String[] expectedValues = {
                "Start -> CS50x",
                "CS50x -> Algorithms",
                "CS50x -> Probability",
                "Algorithms -> Probability",
                "Probability -> Track: Machine Learning"
        };

        int expectedNodes = 5;
        int expectedRels = 5;

        courseAndPrereqTester(baseWorkingQuery, expectedNodes, expectedRels, expectedValues);
    }


    @Test
    public void shouldHandleFourWayDevilishCycle() throws Throwable
    {
        setDBInitStateFromFile("bm-000");
        processRelationshipsFile("bm-000-test-cycle-four-devilish");

        String[] expectedValues = {
//                "CS50x -> Algorithms",
                // TODO: Start here can be any of two options
                // Need to find a way to test it
//                "Start -> CS50x",
                // Same with Algorithms, could go either way
//                "Algorithms -> Probability",
//                "Machine Learning -> Track: Machine Learning",
//                "Probability -> Machine Learning",
//                "Algorithms -> Machine Learning",
//                "CS50x -> Machine Learning",
//                "CS50x -> Probability"
        };

        int expectedNodes = 6;
        int expectedRels = 8;

        courseAndPrereqTester(baseWorkingQuery, expectedNodes, expectedRels, expectedValues);
    }


    @Test
    public void shouldHandleComplexCycles() throws Throwable
    {
        setDBInitStateFromFile("bm-000");
        processRelationshipsFile("bm-000-test-cycle-complex");

        int expectedNodes = 7;
        int expectedRels = 8;

        String[] expectedValues = {
                "Start -> Discrete Math",
                "Start -> Probability",
                "Discrete Math -> CS50x",
                "Probability -> CS50x",
                "CS50x -> Machine Learning",
                "CS50x -> Probabilistic Graphs",
                "Machine Learning -> Track: Machine Learning",
                "Probabilistic Graphs -> Track: Machine Learning"
        };

        courseAndPrereqTester(baseWorkingQuery, expectedNodes, expectedRels, expectedValues);
    }

    @Test
    public void shouldHandleMultiStarts() throws Throwable
    {
        setDBInitStateFromFile("bm-000");
        processRelationshipsFile("bm-000-test-multi-path-start");

        int expectedNodes = 5;
        int expectedRels = 6;

        String[] expectedValues = {
                "Start -> CS50x",
                "Start -> Algorithms",
                "Start -> Machine Learning",
                "CS50x -> Track: Machine Learning",
                "Algorithms -> Track: Machine Learning",
                "Machine Learning -> Track: Machine Learning"
        };

        courseAndPrereqTester(baseWorkingQuery, expectedNodes, expectedRels, expectedValues);
    }





    @Test
    public void shouldHandleComplexScenario() throws Throwable
    {
        setDBInitStateFromFile("bm-000");
        processRelationshipsFile("bm-000-test-full");

        int expectedNodes = 5;
        int expectedRels = 5;

        String query = "MATCH (t: Track) WHERE t.name='Track: Machine Learning' "
                +  "CALL lernt.findCoursePath(t, {userID: '1', userIDPropName: 'id', trackIDPropName: 'id', courseIDPropName: 'id'}) "
                +  "YIELD nodes, relationships "
                +  "RETURN nodes, relationships";

        String[] expectedValues = {
                "Start -> Algorithms",
                "Start -> Probability",
                "Algorithms -> Machine Learning",
                "Probability -> Machine Learning",
                "Machine Learning -> Track: Machine Learning"
        };

        courseAndPrereqTester(query, expectedNodes, expectedRels, expectedValues);
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
        URL url = this.getClass().getResource(filename);
        File file = Paths.get(url.toURI()).toFile();

        LineNumberReader lr = new LineNumberReader(new FileReader(file));
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
            createRelationships(parts);
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
        String query = "MATCH (src #sourceLabel# {id: {sourceID}}) " +
                       "MATCH (trg #targetLabel# {id: {targetID}}) " +
                       "CREATE (src)-[#relLabel#]->(trg)";
        for (String key: params.keySet()) {
            query = query.replaceAll("#" + key + "#", String.valueOf(params.get(key)));
        }

        String repsStr = parts[5];
        int reps = Integer.valueOf(parts[5]);

        for (int i = 0; i < reps; i++) {
            // TODO: Debug cleanup
            StatementResult sr = session.run(query, params);
            ResultSummary rs = sr.summary();
            SummaryCounters sc = rs.counters();
        }
    }


    private void courseAndPrereqTester(String query, int expectedNode, int expectedRels, String[] expectedValues)
    {
        StatementResult sr = session.run(query);
        ResultSummary rs = sr.summary();
        List<Record> recList = sr.list();
        assertTrue(recList.size() > 0);
        Record record = recList.get(0);
        Value nodes = record.get("nodes");
        Value rels = record.get("relationships");

        HashMap<Long, String> map = new HashMap<>();
        for(Value course : nodes.values()) {
            Long id = course.asNode().id();
            map.put(id, course.get("name").asString());
        }

        ArrayList<String> list = new ArrayList<>();
        for (Value prereq : rels.values()) {
            Long startNodeId = prereq.asRelationship().startNodeId();
            Long endNodeId = prereq.asRelationship().endNodeId();
            String startCourseName = map.get(startNodeId);
            String endCourseName = map.get(endNodeId);
            list.add(startCourseName + " -> " + endCourseName);
        }

        for (String tuple : list) {
            System.out.println(tuple);
            System.out.flush();
        }

        assertEquals(expectedNode, nodes.size());
        assertEquals(expectedRels, rels.size());

        for (String tuple : expectedValues) {
            assertTrue(list.contains(tuple));
        }
    }
}
