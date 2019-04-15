package lernt;

import org.neo4j.graphdb.*;

import java.util.*;

/**
 * Collection of data structures and methods
 * to keep track of state of course graph navigation
 */
public class Tracker
{
    private GraphDatabaseService db;
    private Map<Long, VirtualNode> resultNodes;
    private Set<Relationship> resultRels;
    private Set<Long> visited;
    private Set<Node> heads;
    private Map<Long, VirtualNode> realToVirtual;
    private ConfigObject config;
    private Set<Course> userCompleted;
    private Set<Course> resultCourses;

    public Tracker(GraphDatabaseService db, ConfigObject config, Set<Course> userCompleted)
    {
        this.db = db;
        this.resultNodes = new HashMap<>();
        this.resultRels = new HashSet<>();
        this.visited = new HashSet<>();
        this.heads = new HashSet<>();
        this.userCompleted = userCompleted;
        this.realToVirtual = new HashMap<>();
        this.config = config;
    }

//    public Set<Node> getUserCompleted()
//    {
//        return this.userCompleted;
//    }

    public void addToVisited(Node n)
    {
        visited.add(n.getId());
    }

    public boolean hasBeenVisited(Node n)
    {
        return visited.contains(n.getId());
    }

    public VirtualNode addToResultNodes(Node node)
    {
        VirtualNode vn = realToVirtual.get(node.getId());
        if (vn == null) {
            vn = makeVirtualNode(node);
            resultNodes.put(vn.getId(), vn);
            realToVirtual.put(node.getId(), vn);
            return vn;
        }
        return vn;
    }


    private VirtualNode makeVirtualNode(Node node)
    {
        // TODO: This is not necessary, the courseID would be enough
        Label[] labels = new Label[1];
        Map<String, Object> props = node.getAllProperties();
        String id;
        if (node.hasLabel(Label.label("Course"))) {
            labels[0] = Label.label("VirtualCourse");
            id = (String) props.getOrDefault("id", "failure");
        }
        else {
            labels[0] = Label.label("VirtualEnd");
            id = "-1";
        }
        // This need to be retrieved from config, type-checked, etc.
        return new VirtualNode(labels, props, db);
    }


    // TODO: Arguably belongs in a factory class but OK
    public void makeRelationship(Node start, Node end)
    {
        VirtualNode vStart = realToVirtual.get(start.getId());
        if (vStart == null) {
            vStart = addToResultNodes(start);
        }

        // TODO: This should never be happening, maybe throw
        VirtualNode vEnd = realToVirtual.get(end.getId());
        if (vEnd == null) {
            vEnd = addToResultNodes(end);
        }

        RelationshipType type = RelationshipType.withName("NEXT");
        VirtualRelationship vr = vStart.createRelationshipTo(vEnd, type);

        // Need this because otherwise can't comfortably navigate the virtual graph
        vEnd.createRelationshipFrom(vStart, type);
        addToResultRels(vr);
    }

    public boolean checkIfCycle(Node start, Node end) throws Exception
    {
        // TODO: Type check, etc.
//        String endCourseID = (String) end.getProperty("id", "endNode");
        VirtualNode virtualEnd = realToVirtual.get(end.getId());
        VirtualNode virtualStart = realToVirtual.get(start.getId());

        // The virtual end should always be in the solution space
        if (virtualEnd == null) {
            throw new Exception("checkIfCycle logical problem: end Node was not found in current solution space");
        }

        // If the virtualStart is not in the solution space,
        // then it's not possible to create a cycle
        if (virtualStart == null) {
            return false;
        }

        boolean hasCycle = checkIfCycleIn(virtualEnd, virtualStart);

        return hasCycle;
    }


    private boolean checkIfCycleIn(VirtualNode target, VirtualNode current)
    {
        // TODO: Debug remove
        String curName = (String) current.getProperty("name", null);
        Iterator<Relationship> it = current.getRelationships(RelationshipType.withName("NEXT"), Direction.INCOMING).iterator();


        while(it.hasNext()) {
            Relationship rel = it.next();
            Node incoming = rel.getOtherNode(current);
            // TODO: Debug remove
            String preName = (String) incoming.getProperty("name", null);
            // TODO: Merge this
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




    public void buildHead(GraphDatabaseService db) {
        // Fix this, need a proper id
        VirtualNode head = new VirtualNode(-25000, db);
        head.addLabel(Label.label("VirtualPathStart"));
        head.setProperty("name", "VirtualPathStart");

        resultNodes.put(-25000L, head);
        for (Node node : heads) {
            VirtualRelationship rel = head.createRelationshipTo(node, RelationshipType.withName("NEXT"));
            addToResultRels(rel);
        }
    }

    private void addToResultRels(Relationship rel)
    {
        resultRels.add(rel);
    }


    public void addToHeads(Node node)
    {
        VirtualNode vn = realToVirtual.get(node.getId());
        if (vn != null) {
            heads.add(vn);
        }
    }


    public void removeFromHeads(Node node)
    {
        VirtualNode vn = realToVirtual.get(node.getId());
        if (vn != null) {
            heads.remove(vn);
        }
    }

    // TODO: Type check, remove etc.
    // We shouldn't need this method at all if cycle checking works
    public boolean isInResultNodes(Node node)
    {
        return resultNodes.containsKey(node.getId());
    }

    public int getResultNodesSize()
    {
        return resultNodes.size();
    }

    public List<Node> getResultNodesList()
    {
        return new ArrayList<Node>(resultNodes.values());
    }

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

    public boolean hasUserCompletedSimilar(Course course, double similarityThreshold)
    {
        return checkIfSimilar(course, similarityThreshold, userCompleted);
    }

    public boolean resultsIncludeSimilar(Course course, double similarityThreshold)
    {
        return checkIfSimilar(course, similarityThreshold, resultCourses);
    }

    private boolean checkIfSimilar(Course course, double similarityThreshold, Set<Course> set)
    {
        if (set.contains(course)) {
            return true;
        }

        for (Course completed : set) {
            if (completed.getSimilarityCoefficient(course) > similarityThreshold) {
                return true;
            }
        }

        return false;
    }



}
