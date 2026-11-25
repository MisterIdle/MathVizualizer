import { GraphSandbox } from "./GraphSandbox.js?v=2.1";
import { TrigCircleSandbox } from "./TrigCircleSandbox.js?v=2.1";
import { VectorSandbox } from "./VectorSandbox.js?v=2.1";
import { Space3DSandbox } from "./Space3DSandbox.js?v=2.1";
import { CollisionSandbox } from "./CollisionSandbox.js?v=2.1";
import { PhysicsCurvesSandbox } from "./PhysicsCurvesSandbox.js?v=2.1";
import { ProceduralSandbox } from "./ProceduralSandbox.js?v=2.1";

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
