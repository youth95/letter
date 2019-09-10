import { Subject, Observer } from "./observer";

describe('observer', () => {
  class TestSubject extends Subject<number> {
  }

  class TestObserver extends Observer<number> {
    public state:number|null = null;
    update(nextState: number | null): void {
      this.state = nextState;
    }
  }

  it('tests', () => {
    const sub = new TestSubject();
    const t0 = new TestObserver();
    sub.attach(t0);
    sub.attach(t0);
    sub.detach(t0);
    sub.attach(t0);
    sub.setState(1);
    sub.setState(1);
    expect(t0.state).toEqual(1);
    expect(t0.state).toEqual(1);
    expect(sub.getState()).toEqual(1);
  });
});