export class CascadeRule {
    parentKey: string;
    childKey: string;
}

export interface Cascading {
    cascadeRule?: CascadeRule | CascadeRule[];
}

export interface CascadeBy {
    cascadeBy?: any;
}
