import type { Metadata } from "next";
import "../styles/globals.css";

export const metadata: Metadata = {
  title: "CI Pipeline Visualizer",
  description: "Visualize and analyze GitLab CI pipelines"
};

export default function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props;

  return (
    <html lang="en">
      <body className="pipeline-layout">
        {children}
      </body>
    </html>
  );
}
