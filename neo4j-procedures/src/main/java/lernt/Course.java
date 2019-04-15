package lernt;

import org.neo4j.graphdb.GraphDatabaseService;
import org.neo4j.graphdb.Node;

import java.util.HashSet;
import java.util.Set;

public class Course extends ResultNode
{
    private Integer totalIncoming;
    private String category;
    private String[] tags;

    public Course(Node node, ConfigObject config, GraphDatabaseService db)
            throws Exception
    {
        super(node, config, db);

        this.totalIncoming = null;

        // Category field should be required, but just in case
        Object courseCategory = node.getProperty(config.getCourseCategoryPropName(), null);
        if (!(courseCategory instanceof String)) {
            throw new Exception("Course category not a String: " + String.valueOf(courseCategory));
        }
        this.category = (String) courseCategory;

        // Tags are made optional
        // An empty array will mean that tags are not considered in a similarity comparison
        Object courseTags = node.getProperty(config.getCourseTagsPropName(), null);
        if (courseTags == null) {
            this.tags = new String[]{};
        }
        else {
            if (!(courseTags instanceof String[])) {
                throw new Exception("Course tags is not a String array: " + String.valueOf(courseTags));
            }
            this.tags = (String[]) courseTags;
        }
    }


    /**
     * Simple algorithm to determine similitude between categories
     * Returns a coefficient between 0 and 1
     * @param other
     * @return
     */
    public double getSimilarityCoefficient(Course other)
    {
        int matches = 0;

        Set<String> uniques = new HashSet<>();
        String[] otherTags = other.getTags();

        // https://stackoverflow.com/a/29293548/6854595
        for(int i = 0, j = 0; i < tags.length && j < otherTags.length;){
            uniques.add(tags[i]);
            uniques.add(tags[j]);
            int res = tags[i].compareTo(otherTags[j]);
            if(res == 0){
                matches++;
                i++;
                j++;
            } else if(res < 0){
                i++;
            } else{
                j++;
            }
        }

        String otherCategory  = other.getCategory();
        uniques.add(otherCategory);
        uniques.add(category);
        if (category.compareTo(otherCategory) == 0) {
            matches++;
        }

        // Guard division by zero, though this should never happen
        if (uniques.size() == 0) {
            return 0;
        }

        return (double) matches / (double) uniques.size();
    }


    public String getCategory()
    {
        return category;
    }

    public String[] getTags()
    {
        return tags;
    }

    public Integer getTotalIncoming() { return totalIncoming; }

    public void setTotalIncoming(Integer totalIncoming) { this.totalIncoming = totalIncoming; }
}
