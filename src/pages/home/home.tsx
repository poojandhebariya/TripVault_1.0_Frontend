import { useQuery } from "@tanstack/react-query";
import { userQueries } from "../../tanstack/auth/user/queries";

const Home = () => {
  const { getProfile } = userQueries();
  const { data } = useQuery(getProfile());
  return <div>{data?.data?.name}jhghgfh</div>;
};

export default Home;
