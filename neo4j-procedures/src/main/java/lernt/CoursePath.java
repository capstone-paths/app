package lernt;

import org.neo4j.graphdb.*;
import org.neo4j.logging.Log;
import org.neo4j.procedure.*;

import java.util.*;
import java.util.stream.Stream;

/**
 * CoursePath
 * A custom neo4j extension ("procedure") for lernt.io to recommend learning paths based on
 * the most recommended user-built learning paths
 */
public class CoursePath
{
    @Context
    public GraphDatabaseService db;

    @Context
    public Log log;


    @Procedure(name = "lernt.findCoursePath", mode=Mode.SCHEMA)
    public Stream<GraphResult> findCoursePath(@Name("startNode") Node startNode,
                                              @Name("config") Map<String, Object> config) throws Exception
    {
        ConfigObject configuration = new ConfigObject(config);

        Set<Course> completedCourses = getAllUserCourses(db, configuration);
        Tracker tracker = new Tracker(db, configuration, completedCourses);
        ResultNode start = new ResultNode(startNode, configuration, db);
        tracker.addToResultNodes(start);

        Queue<Node> q = new LinkedList<>();

        findCoursePathPrivate(start, tracker, configuration, q);

        // Nothing found
        if (tracker.getResultNodesSize() <= 1) {
            return Stream.empty();
        }

        tracker.buildHead(db);

        List<Node> nodes = tracker.getResultNodesList();
        List<Relationship> relationships = tracker.getResultRelsList();

        return Stream.of(new GraphResult(nodes, relationships));
    }


    private void findCoursePathPrivate(ResultNode current, Tracker tracker, ConfigObject config, Queue<Node> q)
            throws Exception
    {
        // TODO: Debug remove
        String curName = (String) current.getNode().getProperty("name", null);

        CandidateDecider cd = new CandidateDecider(current, tracker, config);
        Set<Course> candidateSet = cd.getCandidateSet();

//        if (candidateSet.size() > 0) {
//            tracker.removeFromHeads(curNode);
//        }

        for (Course candidate : candidateSet)
        {
            Node prereq = candidate.getNode();
            Node currentNode = current.getNode();
            // TODO: Debug remove
            curName = (String) current.getNode().getProperty("name", null);
            String preName = (String) prereq.getProperty("name", null);
            if (!tracker.checkIfCycle(prereq, currentNode)) {
                tracker.makeRelationship(prereq , currentNode);
                tracker.removeFromHeads(currentNode);
                tracker.addToHeads(prereq);
                if (!tracker.hasBeenVisited(prereq)) {
                    tracker.addToVisited(prereq);
                    q.add(prereq);
                }
//                findCoursePathPrivate(prereq, tracker, config);
            }
        }

        Node next;
        while ((next = q.poll()) != null) {
            // TODO: Debug remove
            String nextName = (String) next.getProperty("name", null);
            findCoursePathPrivate(next, tracker, config, q);
        }

    }

    private Set<Course> getAllUserCourses(GraphDatabaseService db, ConfigObject config)
            throws Exception
    {
        Set<Course> set = new HashSet<>();

        String userID = config.getUserID();
        if (userID == null) {
            return set;
        }
        String userLabelName = config.getUserLabelName();
        Label userLabel = Label.label(userLabelName);
        String userIDPropName = config.getUserIDPropName();

        // TODO: Ponder this
        // The procedure doesn't fail if a user id is provided, but not user is matched
        // Is this the behavior we really want?
        Node user = db.findNode(userLabel, userIDPropName, userID);
        if (user == null) {
            return set;
        }

        RelationshipType type = RelationshipType.withName(config.getCompletedCourseRelName());

        Iterator<Relationship> completed = user.getRelationships(Direction.OUTGOING, type).iterator();

        if (!completed.hasNext()) {
            return null;
        }

        while(completed.hasNext()) {
            Relationship rel = completed.next();
            set.add(new Course(rel.getOtherNode(user), config, db));
        }

        return set;
    }


    /**
     * Class defining the result of our search
     * Per the neo4j docs,  must have public fields
     */
    public class GraphResult
    {
        public List<Node> nodes;
        public List<Relationship> relationships;

        public GraphResult(List<Node> nodes, List<Relationship> relationships)
        {
            this.nodes = nodes;
            this.relationships = relationships;
        }
    }
}
