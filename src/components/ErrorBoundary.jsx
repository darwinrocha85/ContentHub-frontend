import { Component } from "react";

/** Red de seguridad global: si algo dentro de una pestaña lanza un error de
 * render que no anticipamos, esto evita que se desmonte toda la app y deje
 * una pantalla en blanco sin ninguna pista. En vez de eso muestra un aviso
 * con botón de "Reintentar" que resetea solo esa sección. */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("ErrorBoundary atrapó un error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-banner">
          ⚠ Algo salió mal mostrando esta sección.{" "}
          <button className="ghost" onClick={() => this.setState({ hasError: false })}>
            Reintentar
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
