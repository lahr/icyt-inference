export class Prediction {

  private static readonly DIGIT_FRACTIONS: number = 3;

  constructor(
    public className: string, public probability: number) {
  }

  public toString(): string {
    return `${this.probability.toFixed(Prediction.DIGIT_FRACTIONS)} - ${this.className}`;
  }
}
