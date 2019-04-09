package lernt;

import org.neo4j.graphdb.Node;

import java.util.HashSet;
import java.util.Set;

public class NewCandidate
{
    private Node courseNode;
    private String category;
    private String[] tags;

    public NewCandidate(Node courseNode, ConfigObject config)
            throws Exception
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
        this.tags = (String[]) courseTags;
    }


    /**
     * Simple algorithm to determine similitude between categories
     * Returns a coefficient between 0 and 1
     * @param otherCandidate
     * @return
     */
    public double isSimilar(NewCandidate otherCandidate)
    {
        int matches = 0;

        Set<String> uniques = new HashSet<>();
        String[] otherTags = otherCandidate.getTags();

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

        String otherCategory  = otherCandidate.getCategory();
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
}
