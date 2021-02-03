class Pen {
    private static readonly motorSpeed = 30;
    private static readonly motorUpRotations = 0.4;
    private static readonly motorDownRotations = 0.4;

    private readonly drivingMotor: motors.Motor;

    private state: PenState;

    constructor(drivingMotor: motors.Motor) {
        this.state = PenState.Unknown;
        this.drivingMotor = drivingMotor;

        this.drivingMotor.reset();
        this.drivingMotor.setBrake(true);
        this.drivingMotor.setInverted(true);
    }

    public initialize(): void {
        this.moveUp();
    }

    public moveUp(): void {
        if (this.state !== PenState.Up) {
            this.drivingMotor.run(Pen.motorSpeed, Pen.motorUpRotations, MoveUnit.Rotations);
            this.state = PenState.Up;
        }
    }

    public moveDown(): void {
        if (this.state !== PenState.Down) {
            this.drivingMotor.run(-1 * Pen.motorSpeed, Pen.motorDownRotations, MoveUnit.Rotations);
            this.state = PenState.Down;
        }
    }
}