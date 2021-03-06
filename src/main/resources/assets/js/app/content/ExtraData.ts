import PropertyTree = api.data.PropertyTree;
import {XDataName} from './XDataName';
import {ExtraDataJson} from '../resource/json/ExtraDataJson';

export class ExtraData
    implements api.Cloneable, api.Equitable {

    private name: XDataName;

    private data: PropertyTree;

    constructor(name: XDataName, data: PropertyTree) {
        this.name = name;
        this.data = data;
    }

    static fromJson(metadataJson: ExtraDataJson): ExtraData {
        return new ExtraData(new XDataName(metadataJson.name), PropertyTree.fromJson(metadataJson.data));
    }

    getData(): PropertyTree {
        return this.data;
    }

    clone(): ExtraData {
        return new ExtraData(this.name, this.data.copy());
    }

    equals(o: api.Equitable): boolean {
        if (!api.ObjectHelper.iFrameSafeInstanceOf(o, ExtraData)) {
            return false;
        }

        let other = <ExtraData>o;

        if (!api.ObjectHelper.equals(this.name, other.name)) {
            return false;
        }

        if (!api.ObjectHelper.equals(this.data, other.data)) {
            return false;
        }

        return true;
    }

    toJson(): ExtraDataJson {
        return {
            name: this.name.toString(),
            data: this.data.toJson()
        };
    }

    getName(): XDataName {
        return this.name;
    }

}
