declare module "gsap" {
  export const gsap: any;
  export namespace gsap {
    namespace core {
      type Timeline = any;
      type Tween = any;
    }
  }
  export default gsap;
}
