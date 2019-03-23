package example;

import org.junit.*;
import org.neo4j.driver.v1.*;
import org.neo4j.harness.junit.Neo4jRule;

import static org.hamcrest.core.IsEqual.equalTo;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertThat;
import static org.hamcrest.collection.IsIterableContainingInOrder.contains;

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
    @Rule
    public Neo4jRule neo4j = new Neo4jRule().withProcedure( CoursePath.class );

    // Shut up the server logger, it produces a lot of noise
    private final static Logger COM_SUN_JERSEY_LOGGER = Logger.getLogger( "com.sun.jersey" );
    static {
        COM_SUN_JERSEY_LOGGER.setLevel( Level.SEVERE );
    }

    private Driver driver;
    private Session session;

    @Before
    public void setUp() {
        driver = GraphDatabase.driver( neo4j.boltURI(), Config.build()
                .withLogging(Logging.console(Level.SEVERE))
                .withEncryptionLevel(Config.EncryptionLevel.NONE ).toConfig());
        session = driver.session();
    }

    @After
    public void tearDown() {
        session.close();
        driver.close();
    }


    @Test
    public void shouldReturnSingleNode() throws Throwable
    {
        URL url = this.getClass().getResource("small-test-000");
        String init = new String(Files.readAllBytes(Paths.get(url.toURI()))).trim();

        Long nodeId = session.run(init).single().get(0).asNode().id();

        String query = "MATCH (c: Course) WHERE c.name='Machine Learning' "
                +  "CALL example.findCoursePath(c, 'recommendations', 'Course', 'Category', "
                +  "'recommendations', 'REQUIRED_BY', 0) "
                +  "YIELD nodes, relationships "
                +  "RETURN nodes";

        List<Record> result = session.run(query).list();
        Value val = result.get(0).get(0);

        assertThat( val.get(0).asNode().id(), equalTo(nodeId) );
    }

    @Test
    public void shouldReturnTwoNodesAndOneLink() throws Throwable
    {
        URL url = this.getClass().getResource("small-test-001");
        String init = new String(Files.readAllBytes(Paths.get(url.toURI()))).trim();
        session.run(init);

        String query = "MATCH (c: Course) WHERE c.name='Machine Learning' "
                +  "CALL example.findCoursePath(c, 'recommendations', 'course', 'category', "
                +  "'recommendations', 'REQUIRED_BY', 0) "
                +  "YIELD nodes, relationships "
                +  "RETURN nodes, relationships";

        Record record = session.run(query).list().get(0);
        Value nodes = record.get("nodes");
        Value rels = record.get("relationships");

        assertEquals(nodes.size(), 2);
        assertEquals(rels.size(), 1);


        String[] expected = {
                "Algorithms -> Machine Learning"
        };

        courseAndPrereqTester(nodes, rels, expected);
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
            assertThat(list, contains(tuple));
        }
    }
}
