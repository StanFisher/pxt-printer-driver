enum ReasonCode {
    Unknown,
    NotAllowed,
    InvalidParameters
}

function reasonCodeToString(code: ReasonCode): string {
    switch (code) {
        case ReasonCode.Unknown:
            return 'Unknown';
            break;
        case ReasonCode.NotAllowed:
            return 'Not Allowed';
            break;
        case ReasonCode.InvalidParameters:
            return 'Invalid Parameters';
            break;
        default:
            return 'Unknown';
            break;
    }
}