
import assert from 'assert';

let ok_ = assert.ok;
let eq_ = assert.equal;


import Device from '../src/device';
import DeviceMeta from '../src/device_meta';
import MetaTransducer from '../src/meta_transducer';


describe("DeviceMeta", () => {

  it("constructor", () => {
    let mockSoxConnection1 = {
      getDomain: () => {
        return "sox.ht.sfc.keio.ac.jp";
      }
    };
    let dName1 = "device1";
    let device1 = new Device(mockSoxConnection1, dName1);

    let dm1 = new DeviceMeta(device1, 'did1', 'dtype1', 'serial1', []);

    eq_(dName1, dm1.getName());
    eq_("did1", dm1.getId());
    eq_("dtype1", dm1.getType());
    eq_("serial1", dm1.getSerialNumber());
    eq_(0, dm1.getMetaTransducers().length);

  });

  it("toXmlString", () => {
    let mockSoxConnection1 = {
      getDomain: () => {
        return "sox.ht.sfc.keio.ac.jp";
      }
    };
    let dName1 = "device1";
    let device1 = new Device(mockSoxConnection1, dName1);

    let mt1 = new MetaTransducer(device1, "current temperature", "temp",
      false, false, "kelvin", 0, 270, 320, 0.1);

    let mt2 = new MetaTransducer(device1, "current heating setpoint", "heat",
      true, false, "kelvin", 0, 280, 300, 0.1);

    let mt3 = new MetaTransducer(device1, "current fan setting", "fan",
      true, true, "hertz", 3);

    let mTransducers1 = [mt1, mt2, mt3];

    let dm1 = new DeviceMeta(device1, 'Royal Thermostat', 'hvac', 'slave3', mTransducers1);

    let xml1 = dm1.toXmlString();
    // console.log(xml1);

    let x1 = `<device xmlns="http://jabber.org/protocol/sox" name="device1" id="Royal Thermostat" type="hvac" serialNumber="slave3"><transducer name="current temperature" id="temp" canActuate="false" hasOwnNode="false" units="kelvin" minValue="270" maxValue="320" resolution="0.1"/><transducer name="current heating setpoint" id="heat" canActuate="true" hasOwnNode="false" units="kelvin" minValue="280" maxValue="300" resolution="0.1"/><transducer name="current fan setting" id="fan" canActuate="true" hasOwnNode="true" units="hertz" unitScalar="3"/></device>`;

    eq_(x1, xml1);
  });

});
