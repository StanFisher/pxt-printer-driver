enum ReasonCode {
    NotAllowed,
    InvalidParameters
}

function reasonCodeToString(code: ReasonCode): string {
    switch (code) {
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