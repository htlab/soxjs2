import assert from 'assert';

let ok_ = assert.ok;
let eq_ = assert.equal;

import SoxUtil from '../src/sox_util';
// import SoxConnection from '../src/sox_connection';
import Device from '../src/device';
import Data from '../src/data';
import TransducerValue from '../src/transducer_value';

let dateEq_ = (x, t) => {
  // console.log("x=" + String(x));
  // console.log("t=" + String(t));
  eq_(x.getFullYear(), t.getFullYear());
  eq_(x.getMonth(), t.getMonth());
  eq_(x.getDate(), t.getDate());

  eq_(x.getHours(), t.getHours());
  eq_(x.getMinutes(), t.getMinutes());
  eq_(x.getSeconds(), t.getSeconds());
};

let utcTime = (y, m, d, hour, min, sec) => {
  var tzOffset = (new Date()).getTimezoneOffset() * 60 * 1000;
  var t = new Date(y, m, d, hour, min, sec, 0);
  return new Date(t.getTime() - tzOffset);
};


describe("SoxUtil", () => {

  it("parseTimestamp", () => {
    var tzOffset = (new Date()).getTimezoneOffset() * 60 * 1000;

    var t1 = "2011-02-25T17:13:20Z";
    var x1 = new Date(2011, 2 - 1, 25, 17, 13, 20, 0);
    x1 = new Date(x1.getTime() - tzOffset);
    // eq_(x1, SoxUtil.parseTimestamp(t1));
    dateEq_(x1, SoxUtil.parseTimestamp(t1));

    var t2 = "2011-02-25T17:13:20+0900";
    var x2 = new Date(2011, 2 - 1, 25, 17, 13, 20, 0);
    // eq_(x2, SoxUtil.parseString(t2));
    dateEq_(x2, SoxUtil.parseTimestamp(t2));
  });

  it("endsWithMeta", () => {
    ok_(SoxUtil.endsWithMeta('hoge_meta'));
    ok_(SoxUtil.endsWithMeta('fugafuga_meta'));

    ok_(!SoxUtil.endsWithMeta(''));
    ok_(!SoxUtil.endsWithMeta('fugafuga_meta_data'));
    ok_(!SoxUtil.endsWithMeta('fugafuga_meta_fugafuga'));
  });

  it("endsWithData", () => {
    ok_(SoxUtil.endsWithData('hoge_data'));
    ok_(SoxUtil.endsWithData('fugafuga_data'));

    ok_(!SoxUtil.endsWithData(''));
    ok_(!SoxUtil.endsWithData('fugafuga_data_meta'));
    ok_(!SoxUtil.endsWithData('fugafuga_data_fugafuga'));
  });

  it("cutMetaSuffix", () => {
    eq_("hoge", SoxUtil.cutMetaSuffix("hoge_meta"));
    eq_("mugamuga", SoxUtil.cutMetaSuffix("mugamuga_meta"));

    eq_("hoge_data", SoxUtil.cutMetaSuffix("hoge_data"));
    eq_("hogera", SoxUtil.cutMetaSuffix("hogera"));
  });

  it("cutDataSuffix", () => {
    eq_("hoge", SoxUtil.cutDataSuffix("hoge_data"));
    eq_("mugamuga", SoxUtil.cutDataSuffix("mugamuga_data"));

    eq_("hoge_meta", SoxUtil.cutDataSuffix("hoge_meta"));
    eq_("hogera", SoxUtil.cutDataSuffix("hogera"));
  });

  it("parseDataPayload", () => {
    let t1 = `<data xmlns='http://jabber.org/protocol/sox'>
      <transducerValue id='temp' typedValue='293.2' rawValue='333.33' timestamp='2011-02-25T17:13:20Z'/>
      <transducerValue id='heat' typedValue='295.4' timestamp='2011-02-25T17:14:19Z'/>
    </data>`;

    let mockSoxConnection1 = {
      getDomain: () => {
        return "sox.ht.sfc.keio.ac.jp";
      }
    };

    let dName1 = "device1";
    let deviceToBind1 = new Device(mockSoxConnection1, dName1);
    SoxUtil.parseDataPayload(t1, deviceToBind1, (data) => {
      let device = data.getDevice();

      eq_(dName1, device.getName());

      let tValues = data.getTransducerValues();

      eq_(2, tValues.length);

      let tv1 = tValues[0];
      let tv2 = tValues[1];

      eq_("temp", tv1.getTransducerId());
      eq_("293.2", tv1.getTypedValue());
      eq_("333.33", tv1.getRawValue());

      // 2011-02-25T17:13:20Z
      dateEq_(utcTime(2011, 2-1, 25, 17, 13, 20), tv1.getTimestamp());


      eq_("heat", tv2.getTransducerId());
      eq_("295.4", tv2.getTypedValue());
      ok_(tv2.getRawValue() === null);

      // 2011-02-25T17:14:19Z
      dateEq_(utcTime(2011, 2-1, 25, 17, 14, 19), tv2.getTimestamp());
    });
  });

  it("parseMetaPayload", () => {
    let t1 = `<device xmlns='http://jabber.org/protocol/sox'
            name='Royal Thermostat'
            id='4d4335b0-4134-11e0-9207-0800200c9a66'
            type='hvac'
            serialNumber='slave3'>
          <transducer
              name='current temperature' id='temp' canActuate='false'
              hasOwnNode='false' units='kelvin' unitScalar='0'
              minValue='270' maxValue='320' resolution='0.1'>
          </transducer>
          <transducer
              name='current heating setpoint' id='heat' canActuate='true'
              hasOwnNode='false' units='kelvin' unitScalar='0'
              minValue='280' maxValue='300' resolution='0.1'>
          </transducer>
          <transducer
              name='current fan setting' id='fan' canActuate='true'
              hasOwnNode='true' units='hertz' unitScalar='3'>
          </transducer>
        </device>`;

    let mockSoxConnection1 = {
      getDomain: () => {
        return "sox.ht.sfc.keio.ac.jp";
      }
    };
    let dName1 = "device1";
    let deviceToBind1 = new Device(mockSoxConnection1, dName1);

    SoxUtil.parseMetaPayload(t1, deviceToBind1, (meta) => {
      let device = meta.getDevice();
      eq_(dName1, device.getName());

      let metaTransducers1 = meta.getMetaTransducers();
      eq_(3, metaTransducers1.length);

      let mt1 = metaTransducers1[0];
      let mt2 = metaTransducers1[1];
      let mt3 = metaTransducers1[2];

      eq_(dName1, mt1.getDevice().getName());
      eq_(dName1, mt2.getDevice().getName());
      eq_(dName1, mt3.getDevice().getName());

      eq_('current temperature', mt1.getName());
      eq_('temp', mt1.getId());
      eq_(false, mt1.canActuate());
      eq_(false, mt1.hasOwnNode());
      eq_("kelvin", mt1.getUnits());
      eq_("0", mt1.getUnitScalar());
      eq_("270", mt1.getMinValue());
      eq_("320", mt1.getMaxValue());
      eq_("0.1", mt1.getResolution());

      eq_("current heating setpoint", mt2.getName());
      eq_("heat", mt2.getId());
      eq_(true, mt2.canActuate());
      eq_(false, mt2.hasOwnNode());
      eq_("kelvin", mt2.getUnits());
      eq_("0", mt2.getUnitScalar());
      eq_("280", mt2.getMinValue());
      eq_("300", mt2.getMaxValue());
      eq_("0.1", mt2.getResolution());

      eq_("current fan setting", mt3.getName());
      eq_("fan", mt3.getId());
      eq_(true, mt3.canActuate());
      eq_(true, mt3.hasOwnNode());
      eq_("hertz", mt3.getUnits());
      eq_("3", mt3.getUnitScalar());
      ok_(mt3.getMinValue() === null);
      ok_(mt3.getMaxValue() === null);
      ok_(mt3.getResolution() === null);

    });

  });
});
