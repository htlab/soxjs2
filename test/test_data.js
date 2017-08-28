import assert from 'assert';

let ok_ = assert.ok;
let eq_ = assert.equal;

import Data from '../src/data';
import Device from '../src/device';
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

describe("Data", () => {

  it("constructor", () => {
    let mockSoxConnection1 = {
      getDomain: () => {
        return "sox.ht.sfc.keio.ac.jp";
      }
    };
    let dName1 = "device1";
    let device1 = new Device(mockSoxConnection1, dName1);

    let t1 = new Data(device1, []);
    eq_(dName1, t1.getDevice().getName());
    // eq_([], t1.getTransducerValues());
    eq_(0, t1.getTransducerValues().length);

    let dName2 = "device2";
    let device2 = new Device(mockSoxConnection1, dName2);

    let tv2_1_date = new Date();
    let tv2_2_date = new Date();

    let tv2_1 = new TransducerValue("t2_1", "raw2_1", "typed2_1", tv2_1_date);
    let tv2_2 = new TransducerValue("t2_2", "raw2_2", "typed2_2", tv2_2_date);
    let tValues2 = [tv2_1, tv2_2];

    let t2 = new Data(device2, tValues2);
    eq_(dName2, t2.getDevice().getName());

    let t_tv2 = t2.getTransducerValues();
    eq_(2, t_tv2.length);
    let t_tv2_1 = t_tv2[0];
    eq_("t2_1", t_tv2_1.getTransducerId());
    eq_("raw2_1", t_tv2_1.getRawValue());
    eq_("typed2_1", t_tv2_1.getTypedValue());
    dateEq_(tv2_1_date, tv2_1.getTimestamp());

    let t_tv2_2 = t_tv2[1];
    eq_("t2_2", t_tv2_2.getTransducerId());
    eq_("raw2_2", t_tv2_2.getRawValue());
    eq_("typed2_2", t_tv2_2.getTypedValue());
    dateEq_(tv2_2_date, tv2_2.getTimestamp());
  });

  it("getRawValues", () => {
    let mockSoxConnection1 = {
      getDomain: () => {
        return "sox.ht.sfc.keio.ac.jp";
      }
    };
    let dName1 = "device2";
    let device1 = new Device(mockSoxConnection1, dName1);

    let tv1_1_date = new Date();
    let tv1_2_date = new Date();

    let tv1_1 = new TransducerValue("t1_1", "raw1_1", "typed1_1", tv1_1_date);
    let tv1_2 = new TransducerValue("t1_2", "raw1_2", "typed1_2", tv1_2_date);
    let tValues2 = [tv1_1, tv1_2];

    let t1 = new Data(device1, tValues2);

    let tRawValues1 = t1.getRawValues();

    assert.deepEqual({ t1_1: "raw1_1", t1_2: "raw1_2" }, tRawValues1);
  });

  it("getTypedValues", () => {
    let mockSoxConnection1 = {
      getDomain: () => {
        return "sox.ht.sfc.keio.ac.jp";
      }
    };
    let dName1 = "device2";
    let device1 = new Device(mockSoxConnection1, dName1);

    let tv1_1_date = new Date();
    let tv1_2_date = new Date();

    let tv1_1 = new TransducerValue("t1_1", "raw1_1", "typed1_1", tv1_1_date);
    let tv1_2 = new TransducerValue("t1_2", "raw1_2", "typed1_2", tv1_2_date);
    let tValues2 = [tv1_1, tv1_2];

    let t1 = new Data(device1, tValues2);

    let tTypedValues1 = t1.getTypedValues();

    assert.deepEqual({ t1_1: "typed1_1", t1_2: "typed1_2" }, tTypedValues1);
  });

  it("toXmlString", () => {
    let mockSoxConnection1 = {
      getDomain: () => {
        return "sox.ht.sfc.keio.ac.jp";
      }
    };
    let dName1 = "device2";
    let device1 = new Device(mockSoxConnection1, dName1);

    let tv1_1_date = new Date();
    let tv1_2_date = new Date();

    let tv1_1 = new TransducerValue("t1_1", "raw1_1", "typed1_1", tv1_1_date);
    let tv1_2 = new TransducerValue("t1_2", "raw1_2", "typed1_2", tv1_2_date);
    let tValues2 = [tv1_1, tv1_2];

    let t1 = new Data(device1, tValues2);

    let tXml1 = t1.toXmlString();
    // console.log(tXml1);

    var x1 = `<device xmlns="http://jabber.org/protocol/sox"><transducerValue id="t1_1" rawValue="raw1_1" typedValue="typed1_1" timestamp="%TIMESTAMP1%"/><transducerValue id="t1_2" rawValue="raw1_2" typedValue="typed1_2" timestamp="%TIMESTAMP2%"/></device>`;
    x1 = x1.replace('%TIMESTAMP1%', tv1_1_date.toISOString());
    x1 = x1.replace('%TIMESTAMP2%', tv1_2_date.toISOString());
    // console.log(x1);
    eq_(x1, tXml1);
  });
});
