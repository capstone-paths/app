package lernt;

import org.neo4j.graphdb.GraphDatabaseService;
import org.neo4j.graphdb.Label;
import org.neo4j.graphdb.Node;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

public class ResultNode
{
    private long originalID;
    private long id;
    private Node node;
    private VirtualNode virtualNode;
    private ConfigObject config;


    public ResultNode(Node node, ConfigObject config, GraphDatabaseService db)
    {
        this.originalID = node.getId();
        this.node = node;

        // There might be an easier way to do this but the APOC interface forces
        // this back-and-forth... It should be a very cheap operation anyway
        List<Label> labels = new ArrayList<>();
        Iterable<Label> it = node.getLabels();
        for (Label l : it) {
            labels.add(l);
        }

        Label[] labelArr = new Label[labels.size()];
        for (int i = 0; i < labels.size(); i++) {
            labelArr[i] = labels.get(i);
        }

        Map<String, Object> props = node.getAllProperties();

        this.virtualNode = new VirtualNode(labelArr, props, db);
    }

    public Node getNode() { return this.node; }

    public VirtualNode getVirtualNode() { return this.virtualNode; }

    public long getOriginalID() { return this.originalID; }

    public long getID() { return this.id; }


    @Override
    public boolean equals(Object o) {
        if (o == this) {
            return true;
        }
        if (!(o instanceof ResultNode)) {
            return false;
        }

        ResultNode rn = (ResultNode) o;

        return originalID == rn.originalID;
    }


    @Override
    public int hashCode()
    {
        int result = 17;
        result = 31 * result + (int) this.originalID;
        return result;
    }
}
