import assert from 'assert';

import TransducerValue from '../src/transducer_value.js';

let eq_ = assert.equal;
let ok_ = assert.ok;

describe("TransducerValue", () => {
  it("constructor", () => {
    let ts1 = new Date(2017, 7, 1, 12, 34, 56);
    let t1 = new TransducerValue("tid1", "raw1", "typed1", ts1);

    eq_("tid1", t1.transducerId);
    eq_("raw1", t1.rawValue);
    eq_("typed1", t1.typedValue);
    eq_(ts1, t1.timestamp);

    let t2 = new TransducerValue("tid2", "raw2", "typed2");
    let timestampAfterT2 = new Date();
    eq_("tid2", t2.transducerId);
    eq_("raw2", t2.rawValue);
    eq_("typed2", t2.typedValue);
    ok_(t2.timestamp !== undefined);
    ok_(t2.timestamp instanceof Date);
    ok_(t2.timestamp.getTime() <= timestampAfterT2.getTime());
  });

  it("getTransducerId", () => {
    let ts1 = new Date(2017, 7, 1, 12, 34, 56);
    let t1 = new TransducerValue("tid1", "raw1", "typed1", ts1);
    eq_("tid1", t1.getTransducerId());
  });

  it("getRawValue", () => {
    let ts1 = new Date(2017, 7, 1, 12, 34, 56);
    let t1 = new TransducerValue("tid1", "raw1", "typed1", ts1);
    eq_("raw1", t1.getRawValue());
  });

  it("getTypedValue", () => {
    let ts1 = new Date(2017, 7, 1, 12, 34, 56);
    let t1 = new TransducerValue("tid1", "raw1", "typed1", ts1);
    eq_("typed1", t1.getTypedValue());
  });

  it("getTimestamp", () => {
    let ts1 = new Date(2017, 7, 1, 12, 34, 56);
    let t1 = new TransducerValue("tid1", "raw1", "typed1", ts1);
    eq_(ts1, t1.getTimestamp());
  });

  it("_getContentForXmlBuild", () => {
    let ts1 = new Date(2017, 7, 1, 12, 34, 56);
    let t1 = new TransducerValue("tid1", "raw1", "typed1", ts1);

    let x1 = {
      '$': {
        id: "tid1",
        rawValue: "raw1",
        typedValue: "typed1",
        timestamp: "2017-08-01T03:34:56.000Z"
      }
    };

    assert.deepEqual(x1, t1._getContentForXmlBuild());
  });
});
