"use client";

import Head from "next/head";
import * as Sentry from "@sentry/nextjs";

export default function Page() {
  return (
    <div style={{ padding: "40px", fontFamily: "sans-serif" }}>
      <Head>
        <title>Sentry Onboarding</title>
      </Head>

      <h1>Sentry Onboarding</h1>

      <p>
        Get started by sending us a sample error:
      </p>
      <button
        type="button"
        style={{
          padding: "12px",
          cursor: "pointer",
          backgroundColor: "#AD6CAA",
          borderRadius: "4px",
          border: "none",
          color: "white",
          fontSize: "14px",
          margin: "18px",
        }}
        onClick={() => {
          throw new Error("Sentry Example Frontend Error");
        }}
      >
        Throw error!
      </button>

      <p>
        Next, look for the error on the <a href="https://sentry.io/issues/">Issues Page</a>.
      </p>
    </div>
  );
}
