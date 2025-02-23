import Head from "next/head";
import FileUploader from "./components/FileUploader";

export default function Fine() {
  return (
    <>
      <Head>
        <title>Ticket Parser</title>
        <meta name="description" content="Upload a ticket image and parse details using AI." />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <main className="h-screen bg-gray-300 text-gray-900" style={{ padding: "20px" }}>
        <FileUploader />
      </main>
    </>
  );
}
