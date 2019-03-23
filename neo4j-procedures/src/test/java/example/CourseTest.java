package example;

import org.junit.Rule;
import org.junit.Test;
import org.neo4j.driver.v1.*;
import org.neo4j.driver.v1.types.Node;
import org.neo4j.harness.junit.Neo4jRule;
import org.neo4j.register.Register;

import static org.hamcrest.core.IsEqual.equalTo;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertThat;
import static org.junit.Assert.assertTrue;
import static org.hamcrest.collection.IsIterableContainingInOrder.contains;

import java.net.URL;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class CourseTest
{
    @Rule
    public Neo4jRule neo4j = new Neo4jRule().withProcedure( CoursePath.class );


//    @Test
//    public void shouldReturnSingleNode() throws Throwable
//    {
//        try(Driver driver = GraphDatabase.driver( neo4j.boltURI(), Config.build()
//                                .withEncryptionLevel( Config.EncryptionLevel.NONE ).toConfig() );
//            Session session = driver.session() )
//        {
//            URL url = this.getClass().getResource("small-test-000");
//            String init = new String(Files.readAllBytes(Paths.get(url.toURI()))).trim();
//
//            String nodeId = session.run(init).single().get(0).get("nodeId").asString();
//
//
//            String query = "MATCH (c: Course) WHERE c.name='Machine Learning' "
//                        +  "CALL example.findCoursePath(c, 'recommendations', 'Course', 'Category', "
//                        +  "'recommendations', 'REQUIRED_BY', 0) "
//                        +  "YIELD nodes, relationships "
//                        +  "RETURN nodes";
//
//            List<Record> result = session.run(query).list();
//            Value val = result.get(0).get(0);
//
//            assertThat( val.get(0).get("nodeId").asString(), equalTo(nodeId) );
//        }
//    }

    @Test
    public void shouldReturnTwoNodesAndOneLink() throws Throwable
    {
        try(Driver driver = GraphDatabase.driver( neo4j.boltURI(), Config.build()
                .withEncryptionLevel( Config.EncryptionLevel.NONE ).toConfig() );
            Session session = driver.session() )
        {
            URL url = this.getClass().getResource("small-test-001");
            String init = new String(Files.readAllBytes(Paths.get(url.toURI()))).trim();

            session.run(init);

            String query = "MATCH (c: Course) WHERE c.name='Machine Learning' "
                    +  "CALL example.findCoursePath(c, 'recommendations', 'course', 'category', "
                    +  "'recommendations', 'REQUIRED_BY', 0) "
                    +  "YIELD nodes, relationships "
                    +  "RETURN nodes, relationships";

            StatementResult sr = session.run(query);
            List<String> keys = sr.keys();
            List<Record> recs = sr.list();
            Record record = recs.get(0);
            Value nodes = record.get("nodes");
            Value rels = record.get("relationships");

            assertEquals(nodes.size(), 2);
            assertEquals(rels.size(), 1);

            HashMap<Long, String> map = new HashMap<>();
            for(Value course : nodes.values()) {
                Long id = course.asNode().id();
                map.put(id, course.get("name").asString());
            }

            Value sample = rels.get(0);

            ArrayList<String> list = new ArrayList<>();
            for (Value prereq : rels.values()) {
                String startCourseName = map.get(prereq.asRelationship().startNodeId());
                String endCourseName = map.get(prereq.asRelationship().endNodeId());
                list.add(startCourseName + " -> " + endCourseName);
            }

            String[] expected = {
                    "Algorithms -> Machine Learning"
            };

            for (String tuple : expected) {
                assertThat(list, contains(tuple));
            }

            System.out.println("End of test 2");
        }
    }


}
