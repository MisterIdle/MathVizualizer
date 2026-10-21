import { TrigCircleSandbox } from "./TrigCircleSandbox.js";
import { VectorSandbox } from "./VectorSandbox.js";
import { GraphSandbox } from "./GraphSandbox.js";
import { SpecialSandbox } from "./SpecialSandbox.js";
import { Space3DSandbox } from "./Space3DSandbox.js";
import { GeometrySandbox } from "./GeometrySandbox.js";

export class SandboxFactory {
  static create(canvas, funcItem, onStateChange) {
    switch (funcItem.sandbox) {
      case "trig":
        return new TrigCircleSandbox(canvas, funcItem, onStateChange);
      case "space3d":
        return new Space3DSandbox(canvas, funcItem, onStateChange);
      case "geometry":
        return new GeometrySandbox(canvas, funcItem, onStateChange);
      case "dot":
      case "cross":
      case "project":
      case "alkashi":
      case "matrix":
      case "barycentre":
      case "ballistic":
      case "vectorfield":
        return new VectorSandbox(canvas, funcItem, onStateChange);
      case "perlin":
      case "colortemp":
        return new SpecialSandbox(canvas, funcItem, onStateChange);
      case "graph":
      default:
        return new GraphSandbox(canvas, funcItem, onStateChange);
    }
  }
}