import assert from 'assert';

let ok_ = assert.ok;
let eq_ = assert.equal;

import XmlUtil from '../src/xml_util';

describe("XmlUtil", () => {
  it("removeXmlDeclaration", () => {
    let t1 = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><data><transducerValue><id>t1</id><rawValue>r1</rawValue></transducerValue><transducerValue><id>t2</id><rawValue>r2</rawValue></transducerValue></data>';
    let x1 = '<data><transducerValue><id>t1</id><rawValue>r1</rawValue></transducerValue><transducerValue><id>t2</id><rawValue>r2</rawValue></transducerValue></data>';
    eq_(x1, XmlUtil.removeXmlDeclaration(t1));
  });

});
