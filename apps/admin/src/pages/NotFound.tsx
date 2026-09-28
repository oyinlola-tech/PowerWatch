import { Link } from "react-router";
import { EmptyState } from "../components/DataState";
import { Card } from "../components/ui";

export default function NotFound() {
  return (
    <Card>
      <EmptyState title="Page not found">
        This address doesn't match any admin screen.{" "}
        <Link to="/" className="font-semibold text-accent hover:underline">Go to the overview</Link>
      </EmptyState>
    </Card>
  );
}
