import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

type MaybeTargets = gsap.TweenTarget | null | undefined;

export function hasTargets(target: MaybeTargets): target is gsap.TweenTarget {
  if (!target) return false;

  if (target instanceof NodeList || target instanceof HTMLCollection) {
    return target.length > 0;
  }

  if (Array.isArray(target)) {
    return target.filter(Boolean).length > 0;
  }

  return true;
}

export function fromTo(
  target: MaybeTargets,
  fromVars: gsap.TweenVars,
  toVars: gsap.TweenVars,
): gsap.core.Tween | undefined {
  if (!hasTargets(target)) return undefined;
  return gsap.fromTo(target, fromVars, toVars);
}

export function to(
  target: MaybeTargets,
  vars: gsap.TweenVars,
): gsap.core.Tween | undefined {
  if (!hasTargets(target)) return undefined;
  return gsap.to(target, vars);
}

export function refreshScrollTrigger(): void {
  requestAnimationFrame(() => ScrollTrigger.refresh());
}
