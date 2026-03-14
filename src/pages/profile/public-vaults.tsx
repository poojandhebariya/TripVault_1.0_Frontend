import { useParams } from "react-router-dom";
import Vaults from "./vaults";

/**
 * Thin wrapper used as the route element for /user/:id/vaults.
 * Reads the id from the URL and forwards it to Vaults in public mode.
 */
const PublicVaults = () => {
  const { id = "" } = useParams<{ id: string }>();
  return <Vaults publicMode id={id} />;
};

export default PublicVaults;
