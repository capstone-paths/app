package lernt;

public class UnorderedTuple
{
    private long a;
    private long b;

    public UnorderedTuple(long a, long b)
    {
        this.a = a;
        this.b = b;
    }

    @Override
    public boolean equals(Object o)
    {
        if (o == this) {
            return true;
        }
        if(!(o instanceof UnorderedTuple)) {
            return false;
        }

        UnorderedTuple t = (UnorderedTuple) o;

        return (a == t.a && b == t.b)
                || (a == t.b && b == t.a);
    }

    @Override
    public int hashCode()
    {
        int result = 17;
        result = 31 * result + (int) (a + b);
        return result;
    }
}
