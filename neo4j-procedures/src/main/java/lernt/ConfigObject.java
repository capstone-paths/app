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
    private String prereqWeightPropName;
    private String prereqLabelName;


    public ConfigObject(Map<String, Object> config)
    {
        this.userID = (String) config.getOrDefault("userID", null);
        this.courseWeightPropName = (String) config.getOrDefault("courseWeightPropName", "recommendations");
        this.courseCategoryPropName = (String) config.getOrDefault("courseCategoryPropName", "subject");
        this.courseLabelName = (String) config.getOrDefault("courseLabelName", "Course");
        this.prereqWeightPropName = (String) config.getOrDefault("prereqWeightPropName", "recommendations");
        this.prereqLabelName = (String) config.getOrDefault("prereqLabelName", "NEXT");
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
}
