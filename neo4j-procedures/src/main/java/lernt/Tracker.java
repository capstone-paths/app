package lernt;

import org.neo4j.graphdb.Node;
import org.neo4j.graphdb.Relationship;
import org.neo4j.graphdb.RelationshipType;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * Collection of data structures and methods
 * to keep track of state of course graph navigation
 */
public class Tracker
{
    private Set<Node> resultNodes;
    private Set<Relationship> resultRels;
    private Set<Long> visited;
    private Set<Node> heads;


    public Tracker()
    {
        this.resultNodes = new HashSet<>();
        this.resultRels = new HashSet<>();
        this.visited = new HashSet<>();
        this.heads = new HashSet<>();
    }


    public void addToResultNodes(Node node)
    {
        resultNodes.add(node);
    }

    // TODO: Arguably belongs in a factory class but OK
    public void makeRelationship(Node from, Node to)
    {
        RelationshipType type = RelationshipType.withName("NEXT");
        VirtualRelationship vr = new VirtualRelationship(from, to, type);
        addToResultRels(vr);
    }

    public void addToResultRels(Relationship rel)
    {
        resultRels.add(rel);
    }


    public void addToVisited(Node node)
    {
        visited.add(node.getId());
    }

    public boolean isInVisited(Node node)
    {
        return visited.contains(node.getId());
    }


    public void addToHeads(Node node)
    {
        heads.add(node);
    }


    public void removeFromHeads(Node node)
    {
        heads.remove(node);
    }

    public boolean isInResultNodes(Node node)
    {
        return resultNodes.contains(node);
    }

    public int getResultNodesSize()
    {
        return resultNodes.size();
    }
}
