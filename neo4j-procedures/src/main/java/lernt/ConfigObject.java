package lernt;

import java.util.Map;

/**
 * ConfigObject
 * A pure data class containing the name parameters for the CoursePath procedure.
 */
public class ConfigObject
{
    private String userID;
    private String courseWeightPropName;
    private String courseLabelName;
    private String courseCategoryPropName;
    private String courseTagsPropName;
    private String prereqWeightPropName;
    private String prereqLabelName;
    private Object similarityThreshold;
    private Object frequencyThreshold;


    public ConfigObject(Map<String, Object> config)
    {
        // TODO: I think these casts are not safe
        this.userID = (String) config.getOrDefault("userID", null);
        this.courseWeightPropName = (String) config.getOrDefault("courseWeightPropName", "recommendations");
        this.courseCategoryPropName = (String) config.getOrDefault("courseCategoryPropName", "subject");
        this.courseTagsPropName = (String) config.getOrDefault("courseTagsPropName", "tags");
        this.courseLabelName = (String) config.getOrDefault("courseLabelName", "Course");
        this.prereqWeightPropName = (String) config.getOrDefault("prereqWeightPropName", "recommendations");
        this.prereqLabelName = (String) config.getOrDefault("prereqLabelName", "NEXT");
        this.frequencyThreshold = config.getOrDefault("frequencyThreshold", 0.2);
        this.similarityThreshold = config.getOrDefault("similarityThreshold", 0.5);
    }


    public String getCourseWeightPropName()
    {
        return courseWeightPropName;
    }


    public String getCourseLabelName()
    {
        return courseLabelName;
    }


    public String getCourseCategoryPropName()
    {
        return courseCategoryPropName;
    }


    public String getPrereqWeightPropName()
    {
        return prereqWeightPropName;
    }


    public String getPrereqLabelName()
    {
        return prereqLabelName;
    }

    public String getCourseTagsPropName()
    {
        return courseTagsPropName;
    }

    public Object getSimilarityThreshold()
    {
        return similarityThreshold;
    }

    public Object getFrequencyThreshold()
    {
        return frequencyThreshold;
    }
}
