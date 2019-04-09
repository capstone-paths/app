package lernt;

import org.neo4j.graphdb.Node;

public class NewCandidate
{
    private Node courseNode;
    private String category;
    private String[] tags;

    public NewCandidate(Node courseNode, ConfigObject config) throws Exception
    {
        this.courseNode = courseNode;

        Object courseCategory = courseNode.getProperty(config.getCourseCategoryPropName());
        if (!(courseCategory instanceof String)) {
            throw new Exception("Course category not a String: " + String.valueOf(courseCategory));
        }
        this.category = (String) courseCategory;

        Object courseTags = courseNode.getProperty(config.getCourseTagsPropName());
        if (!(courseTags instanceof String[])) {
            throw new Exception("Course tags is not a String array: " + String.valueOf(courseTags));
        }
        this.tags = (String []) courseTags;
    }
}
