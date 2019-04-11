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
//    private Set<Node> resultNodes;
    private Map<Long, VirtualNode> resultNodes;
    private Set<Relationship> resultRels;
    private Set<Long> visited;
    private Set<Node> heads;
    private Set<Node> userCompleted;
    private Set<UnorderedTuple> relTuples;
    private Map<Long, VirtualNode> realToVirtual;

    public Tracker(GraphDatabaseService db, Set<Node> userCompleted)
    {
        this.db = db;
//        this.resultNodes = new HashSet<>();
        this.resultNodes = new HashMap<>();
        this.resultRels = new HashSet<>();
        this.visited = new HashSet<>();
        this.heads = new HashSet<>();
        this.userCompleted = userCompleted;
        this.relTuples = new HashSet<>();
        this.realToVirtual = new HashMap<>();
    }

    public void addToResultNodes(Node node)
    {
        VirtualNode vn = makeVirtualNode(node);
        resultNodes.put(vn.getId(), vn);
        realToVirtual.put(node.getId(), vn);
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
    public void makeRelationship(Node from, Node to)
    {
        VirtualNode start = makeVirtualNode(from);
        VirtualNode end = makeVirtualNode(to);

        RelationshipType type = RelationshipType.withName("NEXT");

        VirtualRelationship vr = new VirtualRelationship(start, end, type);
        UnorderedTuple ut = new UnorderedTuple(from.getId(), to.getId());

        relTuples.add(ut);

        resultNodes.put(start.getId(), start);
        resultNodes.put(end.getId(), end);
        // TODO: This really needs to be cleaned up
        realToVirtual.put(from.getId(), start);
        realToVirtual.put(to.getId(), start);

        addToResultRels(vr);
    }

    public boolean checkIfCycle(Node start, Node end)
    {
        // TODO: Type check, etc.
//        String endCourseID = (String) end.getProperty("id", "endNode");
        VirtualNode virtualEnd = resultNodes.get(end.getId());

        if (virtualEnd == null) {
            return false;
        }

        Label[] labels = { Label.label("VirtualCourse") };
        VirtualNode virtualStart = new VirtualNode(labels, start.getAllProperties(), db);
        Relationship rel = virtualEnd.createRelationshipTo(virtualStart, RelationshipType.withName("NEXT"));

        boolean hasCycle = checkIfCycleIn(virtualStart, virtualEnd);

        virtualEnd.delete(rel);

        return hasCycle;
    }


    private boolean checkIfCycleIn(VirtualNode target, VirtualNode current)
    {
        Iterator<Relationship> it = current.getRelationships(RelationshipType.withName("NEXT"), Direction.INCOMING).iterator();

        while(it.hasNext()) {
            Relationship rel = it.next();
            Node incoming = rel.getOtherNode(current);
            // TODO: Merge this
            if (current.equals(target)) {
                return true;
            }
            boolean ret = checkIfCycleIn(target, (VirtualNode) incoming);
            if (ret) {
                return true;
            }
        }

        return false;
    }


    public boolean hasSomeRelationship(Node a, Node b)
    {
        UnorderedTuple ut = new UnorderedTuple(a.getId(), b.getId());
        return relTuples.contains(ut);
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
        return resultNodes.containsKey((String) node.getProperty("courseID"));
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
}
