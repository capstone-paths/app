package lernt;

import org.neo4j.graphdb.Node;
import org.neo4j.graphdb.Relationship;

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
    private List<Node> nodes;
    private List<Relationship> relationships;
    private Set<Long> visited;
    private Set<Node> heads;


    public Tracker()
    {
        this.nodes = new ArrayList<>();
        this.relationships = new ArrayList<>();
        this.visited = new HashSet<>();
        this.heads = new HashSet<>();
    }


    public void addToNodes(Node node)
    {
        nodes.add(node);
    }


    public void addToRelationships(Relationship rel)
    {
        relationships.add(rel);
    }


    public void addToVisited(Node node)
    {
        visited.add(node.getId());
    }


    public void addToHeads(Node node)
    {
        heads.add(node);
    }


    public void removeFromHeads(Node node)
    {
        heads.remove(node);
    }
}
