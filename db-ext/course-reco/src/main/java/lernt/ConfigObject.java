package lernt;

import java.util.Map;

/**
 * ConfigObject
 * A pure data class containing the name parameters for the CoursePath procedure.
 */
public class ConfigObject
{
    private String userID;
    private String userLabelName;
    private String userIDPropName;
    private String completedCourseRelName;
    private String courseWeightPropName;
    private String courseLabelName;
    private String trackLabelName;
    private String courseCategoryPropName;
    private String courseTagsPropName;
    private String courseIDPropName;
    private String trackIDPropName;
    private String prereqWeightPropName;
    private String prereqLabelName;
    private Double similarityThreshold;
    private Double frequencyThreshold;
    private Long prereqMinimumObservations;


    public ConfigObject(Map<String, Object> config)
    {
        // TODO: I think these casts are not safe
        this.userID = (String) config.getOrDefault("userID", null);
        this.userIDPropName = (String) config.getOrDefault("userIDPropName", "userID");
        this.courseIDPropName = (String) config.getOrDefault("courseIDPropName", "courseID");
        this.userLabelName = (String) config.getOrDefault("userLabelName", "User");
        this.completedCourseRelName = (String) config.getOrDefault("completedCourseRelName", "COMPLETED");
        this.courseWeightPropName = (String) config.getOrDefault("courseWeightPropName", "recommendations");
        this.courseCategoryPropName = (String) config.getOrDefault("courseCategoryPropName", "subject");
        this.courseTagsPropName = (String) config.getOrDefault("courseTagsPropName", "tags");
        this.courseLabelName = (String) config.getOrDefault("courseLabelName", "Course");
        this.trackLabelName = (String) config.getOrDefault("trackLabelName", "Track");
        this.trackIDPropName = (String) config.getOrDefault("trackIDPropName", "trackID");
        this.prereqWeightPropName = (String) config.getOrDefault("prereqWeightPropName", "recommendations");
        this.prereqLabelName = (String) config.getOrDefault("prereqLabelName", "NEXT");
        this.frequencyThreshold = (Double) config.getOrDefault("frequencyThreshold", 0.2);
        this.similarityThreshold = (Double) config.getOrDefault("similarityThreshold", 0.5);
        this.prereqMinimumObservations = (Long) config.getOrDefault("prereqMinimumObservations", 1L);
    }

    public Long getPrereqMinimumObservations()
    {
        return prereqMinimumObservations;
    }

    public String getTrackIDPropName() { return trackIDPropName; }

    public String getCourseIDPropName()
    {
        return courseIDPropName;
    }

    public String getCourseWeightPropName()
    {
        return courseWeightPropName;
    }

    public String getTrackLabelName() { return trackLabelName; }


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

    public String getUserID()
    {
        return userID;
    }

    public String getUserLabelName()
    {
        return userLabelName;
    }

    public String getCompletedCourseRelName()
    {
        return completedCourseRelName;
    }

    public String getUserIDPropName()
    {
        return userIDPropName;
    }
}
