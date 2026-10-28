import { redirect } from "next/navigation";

// The old History page is now the Library.
export default function Page() {
  redirect("/library");
}
