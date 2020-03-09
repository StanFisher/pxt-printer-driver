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

    private readonly up: number;
    private readonly down: number;
    private readonly left: number;
    private readonly right: number;

    private currentState: PenState;
    private currentLocation: number | undefined;

    private isInitializing: boolean;

    constructor() {
        this.tiltMotor = motors.mediumA;
        this.moveMotor = motors.largeC;
        this.stateSensor = sensors.infrared4;

        this.defaultMotorPower = 75;
        this.stateSensorProximityThreshold = 5;

        this.up = 1;
        this.down = -1;
        this.left = -1;
        this.right = 1;

        this.currentState = PenState.Unknown;
        this.currentLocation = undefined;

        this.isInitializing = false;
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
        this.isInitializing = true;

        this.tiltMotor.setBrake(true);
        this.moveMotor.setBrake(true);

        this.tiltMotor.reset();
        this.moveMotor.reset();

        this.stateSensor.setMode(InfraredSensorMode.Proximity);
        this.stateSensor.setPromixityThreshold(InfraredSensorEvent.ObjectNear, this.stateSensorProximityThreshold);

        this.currentState = PenState.Unknown;
        this.currentLocation = undefined;

        this.movePenToSafeLocation();

        this.lowerPenAllTheWay();

        // Lift pen a little so we don't write while initializing pen location
        this.prepareForWriting();

        // Move pen to middle location
        this.moveMotor.run(this.left * this.defaultMotorPower, 3.5, MoveUnit.Rotations);
        this.currentLocation = 0;
        this.moveTo(MaximumPenLocation / 2, this.defaultMotorPower);

        // Lift pen all the way
        this.raiseAllTheWay();

        this.isInitializing = false;
    }

    public raiseAllTheWay(): void {
        this.raiseErrorIfInitializing('Pen.raiseAllTheWay');

        if (!this.isInitialized) {
            this.initialize();
        }

        if (this.currentState !== PenState.RaisedAllTheWay) {
            this.lowerToWrite();  // It's easier if we just lower it all the way first
            this.tiltMotor.run(this.up * this.defaultMotorPower, 2.5, MoveUnit.Rotations);
        }
    }

    public prepareForWriting(): void {
        const functionName = 'Pen.prepareForWriting';

        this.raiseErrorIfInitializing(functionName);

        if (!this.isInitialized) {
            this.initialize();
        }

        switch (this.currentState) {
            case PenState.RaisedAllTheWay:
                this.lowerToWrite();  // Relying on lowerToWrite function to move pen to safe location if needed
                this.tiltMotor.run(this.up * this.defaultMotorPower, 1, MoveUnit.Rotations);
                this.currentState = PenState.Ready;
                break;
            case PenState.Ready:
                // Already in the correct state
                break;
            case PenState.Writing:
                this.tiltMotor.run(this.up * this.defaultMotorPower, 1, MoveUnit.Rotations);
                this.currentState = PenState.Ready;
                break;
            default:
                Error.raise(functionName, ReasonCode.Unknown, 'Unknown state');
                this.currentState = PenState.Unknown;
                break;
        }
    }

    public lowerToWrite(): void {
        const functionName = 'Pen.lowerToWrite';

        this.raiseErrorIfInitializing(functionName);

        if (!this.isInitialized) {
            this.initialize();
        }

        switch (this.currentState) {
            case PenState.RaisedAllTheWay:
                this.movePenToSafeLocation();
                this.lowerPenAllTheWay();
                break;
            case PenState.Ready:
                this.lowerPenAllTheWay();
                break;
            case PenState.Writing:
                // Already in the correct state
                break;
            default:
                Error.raise(functionName, ReasonCode.Unknown, 'Unknown state');
                break;
        }
    }

    public moveTo(location: number, speed: number): void {
        const functionName = 'Pen.moveTo';

        if (this.currentState !== PenState.Ready && this.currentState !== PenState.Writing) {
            Error.raise(functionName, ReasonCode.NotAllowed, `State ${this.currentState} not allowed`);
        } else if (location < 0 || location > MaximumPenLocation) {
            Error.raise(functionName, ReasonCode.InvalidParameters, `Location ${location} invalid`);
        } else if (speed < 0 || speed > MaximumPenSpeed) {
            Error.raise(functionName, ReasonCode.InvalidParameters, `Speed ${speed} invalid`);
        } else if (location !== this.currentLocation && speed > 0) {
            this.moveMotor.run(
                location < this.currentLocation
                    ? this.left * speed
                    : this.right * speed,
                Math.abs(location - this.currentLocation) / 100,
                MoveUnit.Rotations
            );

            this.currentLocation = location;
        }
    }

    private movePenToSafeLocation(): void {
        this.moveMotor.run(this.left * this.defaultMotorPower, 3.5, MoveUnit.Rotations);
        this.moveMotor.run(this.right * this.defaultMotorPower, 1, MoveUnit.Rotations);
    }

    private lowerPenAllTheWay(): void {
        if (!this.isDownForWriting) {
            this.tiltMotor.run(this.down * this.defaultMotorPower);
            this.stateSensor.pauseUntil(InfraredSensorEvent.ObjectNear);
            this.tiltMotor.stop();
            this.currentState = PenState.Writing;
        }
    }

    private raiseErrorIfInitializing(functionName: string): void {
        if (this.isInitializing) {
            Error.raise(functionName || 'Unknown Function', ReasonCode.NotAllowed, 'Pen initializing');
        }
    }
}