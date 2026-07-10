export type WorldPointId = "memoria" | "comum" | "missao";

export interface WorldPoint {
  id: WorldPointId;
  kind: "memória" | "pauta" | "missão";
  title: string;
  summary: string;
  body: string;
  x: number;
  z: number;
  actionLabel?: string;
  actionHref?: string;
  external?: boolean;
}

export const WORLD_POINTS: WorldPoint[] = [
  {
    id: "memoria",
    kind: "memória",
    title: "Memorial 9 de Novembro: a cidade carrega suas fraturas",
    summary: "A greve de 1988 e a memória dos três operários mortos diante da CSN.",
    body:
      "Projetado por Oscar Niemeyer e inaugurado em 1º de maio de 1989, o memorial homenageia William Fernandes Leite, Valmir Freitas Monteiro e Carlos Augusto Barroso, mortos em 9 de novembro de 1988 durante a repressão à greve da CSN. O monumento sofreu um atentado na noite seguinte à inauguração e foi reerguido com as fraturas preservadas como parte de sua memória.",
    x: -2.35,
    z: -2.8,
    actionLabel: "Consultar fonte oficial",
    actionHref: "https://turismo.voltaredonda.rj.gov.br/cultura-patrimonio/",
    external: true,
  },
  {
    id: "comum",
    kind: "pauta",
    title: "Do abandono ao comum",
    summary: "Cuidado, autogestão e tecnologia popular mudam a paisagem.",
    body:
      "O jardim representa uma cidade organizada para a vida: apoio mútuo, moradia digna, mobilidade pública, cultura livre, agroecologia e poder popular.",
    x: 2.1,
    z: -6.1,
    actionLabel: "Conhecer as pautas",
    actionHref: "/pautas",
  },
  {
    id: "missao",
    kind: "missão",
    title: "Toda transformação começa com um próximo passo",
    summary: "Escolha uma missão possível e leve a jornada para fora da tela.",
    body:
      "A Central de Missões conecta o território 3D ao fluxo já existente da landing: celular, rua, contribuição ou compartilhamento.",
    x: 0,
    z: -9.35,
    actionLabel: "Escolher minha missão",
    actionHref: "/#escolher-missao",
  },
];

const WORLD_ARRIVAL_COMPOSITION: Partial<Record<WorldPointId, { x: number; z: number; radius: number }>> = {
  memoria: { x: 0.92, z: 0.18, radius: 0.18 },
  comum: { x: -1, z: 0.25, radius: 0.2 },
  missao: { x: 1, z: 0.25, radius: 0.2 },
};

export interface PlayerInput {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  joystickX: number;
  joystickY: number;
  paused: boolean;
}

export function createPlayerInput(): PlayerInput {
  return {
    forward: false,
    backward: false,
    left: false,
    right: false,
    joystickX: 0,
    joystickY: 0,
    paused: false,
  };
}

export class PlayerSimulation {
  x = 0;
  z = 2.25;
  heading = Math.PI;
  moving = false;
  private target: (Pick<WorldPoint, "x" | "z"> & Partial<Pick<WorldPoint, "id">> & {
    arrivalRadius: number;
  }) | null = null;

  moveTo(point: Pick<WorldPoint, "x" | "z"> & Partial<Pick<WorldPoint, "id">>) {
    const composition = point.id ? WORLD_ARRIVAL_COMPOSITION[point.id] : undefined;
    this.target = {
      x: point.x + (composition?.x ?? 0),
      z: point.z + (composition?.z ?? 0),
      id: point.id,
      arrivalRadius: composition?.radius ?? 0.7,
    };
  }

  cancelMove() {
    this.target = null;
    this.moving = false;
  }

  get autoNavigating() {
    return this.target !== null;
  }

  get navigationTargetId(): WorldPointId | null {
    return this.target?.id ?? null;
  }

  step(input: PlayerInput, delta: number) {
    if (input.paused) {
      this.moving = false;
      return;
    }

    const keyboardX = Number(input.right) - Number(input.left);
    const keyboardZ = Number(input.backward) - Number(input.forward);
    let moveX = keyboardX + input.joystickX;
    let moveZ = keyboardZ + input.joystickY;
    let magnitude = Math.hypot(moveX, moveZ);

    if (magnitude >= 0.08) {
      this.target = null;
    } else if (this.target) {
      moveX = this.target.x - this.x;
      moveZ = this.target.z - this.z;
      magnitude = Math.hypot(moveX, moveZ);
      if (magnitude < this.target.arrivalRadius) {
        this.target = null;
        this.moving = false;
        return;
      }
    }

    if (magnitude < 0.08) {
      this.moving = false;
      return;
    }

    moveX /= Math.max(1, magnitude);
    moveZ /= Math.max(1, magnitude);
    const speed = 2.55;
    this.x = clamp(this.x + moveX * speed * delta, -4.7, 4.7);
    this.z = clamp(this.z + moveZ * speed * delta, -10.4, 2.5);
    this.heading = Math.atan2(-moveX, -moveZ);
    this.moving = true;
  }

  nearestPoint(radius = 1.35): WorldPoint | null {
    let nearest: WorldPoint | null = null;
    let nearestDistance = radius;

    for (const point of WORLD_POINTS) {
      const distance = Math.hypot(this.x - point.x, this.z - point.z);
      if (distance < nearestDistance) {
        nearest = point;
        nearestDistance = distance;
      }
    }

    return nearest;
  }
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
