package lernt;

import org.neo4j.graphdb.*;

import java.util.*;

/**
 * Collection of data structures and methods keeping track
 * of graph navigation
 */
public class Tracker
{
    private GraphDatabaseService db;            // database object for context
    private ConfigObject config;                // the configuration parameters passed in to the procedure
    private Map<Long, ResultNode> resultNodes;  // final result nodes, mapped by original node id
    private Set<Relationship> resultRels;       // final result relationships
    private Set<ResultNode> visited;            // keep track of visited nodes in graph; useful for BF recursion
    private Set<Course> userCompleted;          // courses that the user has completed
    private Set<ResultNode> heads;              // the current heads of the results tree


    /**
     * Instantiates a tracker
     * @param db             Neo4j database context
     * @param config         Configuration for the neo4j custom procedure
     * @param userCompleted  Set of user completed courses
     */
    public Tracker(GraphDatabaseService db, ConfigObject config, Set<Course> userCompleted)
    {
        this.db = db;
        this.config = config;
        this.resultNodes = new HashMap<>();
        this.resultRels = new HashSet<>();
        this.visited = new HashSet<>();
        this.heads = new HashSet<>();
        this.userCompleted = userCompleted;
    }


    /**
     * Creates a virtual relationship between two nodes, and adds it to the final results
     * @param start  The starting node; a prereq in the course model
     * @param end    The end node
     */
    public void makeRelationship(ResultNode start, ResultNode end)
    {
        long startID = start.getOriginalID();
        VirtualNode vStart = resultNodes.containsKey(startID) ?
                resultNodes.get(startID).getVirtualNode() : start.getVirtualNode();

        long endID = end.getOriginalID();
        VirtualNode vEnd = resultNodes.containsKey(endID) ?
                resultNodes.get(endID).getVirtualNode() : start.getVirtualNode();

        // This whole section should be cleaned up with a proper abstraction; it's messy
        Label c = Label.label(config.getCourseLabelName());
        Label t = Label.label(config.getTrackLabelName());

        String startId;
        if (start.getNode().hasLabel(c)) {
            startId = (String) start.getNode().getProperty(config.getCourseIDPropName());
        } else if (start.getNode().hasLabel(t)) {
            startId = (String) start.getNode().getProperty(config.getTrackIDPropName());
        } else {
            startId = "-1";
        }

        String endId;
        if (end.getNode().hasLabel(c)) {
            endId = (String) end.getNode().getProperty(config.getCourseIDPropName());
        } else if (start.getNode().hasLabel(t)) {
            endId = (String) end.getNode().getProperty(config.getTrackIDPropName());
        } else {
            endId = "-1";
        }

        RelationshipType type = RelationshipType.withName("NEXT");
        VirtualRelationship vr = vStart.createRelationshipTo(vEnd, type);
        vr.setProperty("originalStartID", startId);
        vr.setProperty("originalEndID", endId);

        // Need this because otherwise can't comfortably navigate the virtual graph
        vEnd.createRelationshipFrom(vStart, type);
        addToResultRels(vr);
    }


    /**
     * Checks if adding a node to the virtual set will cause a cycle
     * @param start      The prereq
     * @param end        The course the prereq links to
     * @return           True if cycle, false otherwise
     * @throws Exception If a prereq is not in the solutions
     */
    public boolean checkIfCycle(ResultNode start, ResultNode end) throws Exception
    {
        long startID = start.getOriginalID();
        long endID = end.getOriginalID();

        // The virtual end should always be in the solution space
        if (!resultNodes.containsKey(endID)) {
            throw new Exception("checkIfCycle logical problem: end Node was not found in current solution space");
        }

        // If the virtualStart is not in the solution space,
        // then it's not possible to create a cycle
        if (!resultNodes.containsKey(startID)) {
            return false;
        }

        VirtualNode virtualEnd = resultNodes.get(endID).getVirtualNode();
        VirtualNode virtualStart = resultNodes.get(startID).getVirtualNode();

        return checkIfCycleIn(virtualEnd, virtualStart);
    }


    /**
     * Navigates through the solution tree to check if linking the target node will cause a cycle
     * @param target   The course we'd like to link to
     * @param current  The current course in recursion
     * @return         True if cycle, false if not
     */
    private boolean checkIfCycleIn(VirtualNode target, VirtualNode current)
    {
        Iterator<Relationship> it = current
                .getRelationships(RelationshipType.withName("NEXT"), Direction.INCOMING).iterator();


        while(it.hasNext()) {
            Relationship rel = it.next();
            Node incoming = rel.getOtherNode(current);
            if (incoming.getId() == target.getId()) {
                return true;
            }
            boolean ret = checkIfCycleIn(target, (VirtualNode) incoming);
            if (ret) {
                return true;
            }
        }

        return false;
    }


    /**
     * Builds heads of result tree before returning results
     * @param db  Database context
     */

    public void buildHead(GraphDatabaseService db) {
        // TODO: This builds two virtual nodes in succession, should clean up
        VirtualNode head = new VirtualNode(Long.MIN_VALUE, db);
        head.addLabel(Label.label("PathStart"));
        head.setProperty("name", "Start");
        ResultNode rn = new ResultNode(head, config, db);

        resultNodes.put(rn.getOriginalID(), rn);
        for (ResultNode node : heads) {
            makeRelationship(rn, node);
        }
    }


    /**
     * Checks if a user has completed a similar course
     * We don't want to add courses that are too similar to the result collection
     * @param course
     * @param similarityThreshold
     * @return
     */
    public boolean hasUserCompletedSimilar(Course course, double similarityThreshold)
    {
        if (userCompleted.contains(course)) {
            return true;
        }

        for (Course completed : userCompleted) {
            if (completed.getSimilarityCoefficient(course) > similarityThreshold) {
                return true;
            }
        }

        return false;
    }


    /**
     * Check if the the result set includes a similar course
     * @param course
     * @param similarityThreshold
     * @return
     */
    public boolean resultsIncludeSimilar(Course course, double similarityThreshold)
    {
        // We are looking for similar courses; this is to avoid
        // the same course being flagged as similar
        if (resultNodes.containsKey(course.getOriginalID())) {
            return false;
        }

        for (ResultNode completed : resultNodes.values()) {
            if (!(completed instanceof Course)) {
                continue;
            }

            Course c = (Course) completed;

            if (c.getSimilarityCoefficient(course) > similarityThreshold) {
                return true;
            }
        }

        return false;
    }


    /**
     * Transforms the result nodes collection to a list, as required by the Neo4j API
     * @return  The list of nodes
     */
    public List<Node> getResultNodesList()
    {
        List<Node> list = new ArrayList<>();
        for (ResultNode r : resultNodes.values()) {
            list.add(r.getVirtualNode());
        }
        return list;
    }


    /**
     * Transforms the result relationships to a list, as required by the Neo4j API
     * @return The list of relationships
     */
    public List<Relationship> getResultRelsList()
    {
        ArrayList<Relationship> list = new ArrayList<>();
        list.addAll(resultRels);
        return list;
    }


    public boolean hasUserCompleted(Node course)
    {
        return userCompleted.contains(course);
    }


    public ResultNode makeResultNode(Node node) {
        return new ResultNode(node, this.config, this.db);
    }


    public Course makeCourse(Node node)
            throws Exception
    {
        return new Course(node, this.config, this.db);
    }


    public void addToVisited(ResultNode n)
    {
        visited.add(n);
    }


    public boolean hasBeenVisited(ResultNode n)
    {
        return visited.contains(n);
    }


    public void addToResultNodes(ResultNode node)
    {
        resultNodes.putIfAbsent(node.getOriginalID(), node);
    }


    private void addToResultRels(Relationship rel)
    {
        resultRels.add(rel);
    }


    public void addToHeads(ResultNode node)
    {
        heads.add(node);
    }


    public void removeFromHeads(ResultNode node)
    {
        heads.remove(node);
    }


    public int getResultNodesSize()
    {
        return resultNodes.size();
    }
}
