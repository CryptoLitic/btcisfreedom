import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./styles.css";

// Error boundary to catch runtime crashes
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  componentDidCatch(error, info) {
    console.error("Runtime error:", error, info);
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{margin:"20px", padding:"12px", border:"1px solid #f00", background:"#111", color:"#fff"}}>
          <h2>Runtime error</h2>
          <pre style={{whiteSpace:"pre-wrap"}}>{String(this.state.error)}</pre>
          <p>Check the browser console for details.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

function Root() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </BrowserRouter>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<Root />);
