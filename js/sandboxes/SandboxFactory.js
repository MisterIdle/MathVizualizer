import { GraphSandbox } from "./GraphSandbox.js";
import { TrigCircleSandbox } from "./TrigCircleSandbox.js";
import { VectorSandbox } from "./VectorSandbox.js";
import { Space3DSandbox } from "./Space3DSandbox.js";
import { CollisionSandbox } from "./CollisionSandbox.js";
import { PhysicsCurvesSandbox } from "./PhysicsCurvesSandbox.js";
import { ProceduralSandbox } from "./ProceduralSandbox.js";

export class SandboxFactory {
  static create(canvas, concept, onStateChange, onInteract) {
    switch (concept.sandbox) {
      case "trig":
        return new TrigCircleSandbox(canvas, concept, onStateChange, onInteract);
      case "vector":
        return new VectorSandbox(canvas, concept, onStateChange, onInteract);
      case "space3d":
        return new Space3DSandbox(canvas, concept, onStateChange, onInteract);
      case "collision":
        return new CollisionSandbox(canvas, concept, onStateChange, onInteract);
      case "physics":
        return new PhysicsCurvesSandbox(canvas, concept, onStateChange, onInteract);
      case "procedural":
        return new ProceduralSandbox(canvas, concept, onStateChange, onInteract);
      case "graph":
      default:
        return new GraphSandbox(canvas, concept, onStateChange, onInteract);
    }
  }
}
