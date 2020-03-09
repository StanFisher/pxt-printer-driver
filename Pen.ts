const MaximumPenLocation = 285;
const MaximumPenSpeed = 100;

enum PenState {
    Unknown,
    RaisedAllTheWay,
    Ready,
    Writing
}

class Pen {
    private readonly tiltMotor: motors.Motor;
    private readonly moveMotor: motors.Motor;
    private readonly stateSensor: sensors.InfraredSensor;

    private readonly defaultMotorPower: number;
    private readonly stateSensorProximityThreshold: number;

    private currentState: PenState;
    private currentLocation: number;

    constructor() {
        this.tiltMotor = motors.mediumA;
        this.moveMotor = motors.largeC;
        this.stateSensor = sensors.infrared4;

        this.defaultMotorPower = 75;
        this.stateSensorProximityThreshold = 5;

        this.currentState = PenState.Unknown;
        this.currentLocation = undefined;
    }

    private get isInitialized(): boolean {
        return this.currentState !== PenState.Unknown && this.currentLocation !== undefined;
    }

    private get isDownForWriting(): boolean {
        return this.stateSensor.proximity() === this.stateSensorProximityThreshold;
    }

    public get state(): PenState {
        return this.currentState;
    }

    public initialize(): void {
        this.tiltMotor.setBrake(true);
        this.moveMotor.setBrake(true);

        this.tiltMotor.reset();
        this.moveMotor.reset();

        this.stateSensor.setMode(InfraredSensorMode.Proximity);
        this.stateSensor.setPromixityThreshold(InfraredSensorEvent.ObjectNear, this.stateSensorProximityThreshold);

        // Move pen to safe location so it doesn't get tangled up while tilting
        this.moveMotor.run(-1 * this.defaultMotorPower, 3.5, MoveUnit.Rotations);
        this.moveMotor.run(this.defaultMotorPower, 1, MoveUnit.Rotations);

        if (!this.isDownForWriting) {
            this.tiltMotor.run(-1 * this.defaultMotorPower);
            this.stateSensor.pauseUntil(InfraredSensorEvent.ObjectNear);
            this.tiltMotor.stop();
            this.currentState = PenState.Writing;
        }

        // Lift pen a little so we don't write while initializing pen location
        this.prepareForWriting();

        // Move pen to middle location
        this.moveMotor.run(-1 * this.defaultMotorPower, 3.5, MoveUnit.Rotations);
        this.currentLocation = 0;
        this.moveTo(MaximumPenLocation / 2, this.defaultMotorPower);

        // Lift pen all the way
        this.raiseAllTheWay();
    }

    public raiseAllTheWay(): void {
        // if (!this.isInitialized) {
        //     this.initialize();  // The last step in initialize is to raise all the way, so we are now done
        // } else {
        //     if (this.currentState !== PenState.RaisedAllTheWay) {
        //         let x = 0;
        //     }
        // }
    }

    public prepareForWriting(): void {
        if (this.currentState === PenState.Writing) {
            this.tiltMotor.run(this.defaultMotorPower, 1, MoveUnit.Rotations);
        }
    }

    public lowerToWrite(): void {
        if (this.currentState === PenState.Ready) {
            this.tiltMotor.run(-1 * this.defaultMotorPower, 1, MoveUnit.Rotations);
        }
    }

    public moveTo(location: number, speed: number): void {
        const functionName = '5';

        if (this.currentState !== PenState.Ready && this.currentState !== PenState.Writing) {
            Error.raise(functionName, ReasonCode.NotAllowed, `State ${this.currentState} not allowed`);
        } else if (location < 0 || location > MaximumPenLocation) {
            Error.raise(functionName, ReasonCode.InvalidParameters, `Location ${location} invalid`);
        } else if (speed < 0 || speed > MaximumPenSpeed) {
            Error.raise(functionName, ReasonCode.InvalidParameters, `Speed ${speed} invalid`);
        } else if (location !== this.currentLocation && speed > 0) {
            this.moveMotor.run(
                location < this.currentLocation
                    ? -1 * speed
                    : speed,
                Math.abs(location - this.currentLocation) / 100,
                MoveUnit.Rotations
            );

            this.currentLocation = location;
        }
    }
}