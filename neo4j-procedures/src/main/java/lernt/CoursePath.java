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

        Set<Node> completedCourses = getAllUserCourses(configuration);
        Tracker tracker = new Tracker(db, completedCourses);

        findCoursePathPrivate(startNode, tracker, configuration);

        // Nothing found
        if (tracker.getResultNodesSize() <= 1) {
            return Stream.empty();
        }

        tracker.buildHead(db);

        List<Node> nodes = tracker.getResultNodesList();
        List<Relationship> relationships = tracker.getResultRelsList();

        return Stream.of(new GraphResult(nodes, relationships));
    }


    private void findCoursePathPrivate(Node curNode, Tracker tracker, ConfigObject config)
            throws Exception
    {
        CandidateDecider cd = new CandidateDecider(curNode, tracker, config);
        Set<NewCandidate> candidateSet = cd.getCandidateSet();

        if (candidateSet.size() > 0) {
            tracker.removeFromHeads(curNode);
        }

        for (NewCandidate candidate : candidateSet)
        {
            Node prereq = candidate.getCourseNode();
            // TODO: Debug remove
            String curName = (String) curNode.getProperty("name", null);
            String preName = (String) prereq.getProperty("name", null);
            if (!tracker.checkIfCycle(curNode, prereq)) {
                tracker.makeRelationship(prereq , curNode);
                tracker.addToHeads(prereq);
                findCoursePathPrivate(prereq, tracker, config);
            }
        }
    }

    private Set<Node> getAllUserCourses(ConfigObject config)
    {
        Set<Node> set = new HashSet<>();

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
            set.add(rel.getOtherNode(user));
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
