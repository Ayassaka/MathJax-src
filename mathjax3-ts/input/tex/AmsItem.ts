/*************************************************************
 *
 *  MathJax/jax/input/TeX/AmsItem.ts
 *
 *  Implements the TeX InputJax that reads mathematics in
 *  TeX and LaTeX format and converts it to the MML ElementJax
 *  internal format.
 *
 *  ---------------------------------------------------------------------
 *
 *  Copyright (c) 2009-2019 The MathJax Consortium
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */


import {ArrayItem, EnvList} from './StackItem.js';
import {ParserUtil} from './ParserUtil.js';
import {TreeHelper} from './TreeHelper.js';
import {MmlNode} from '../../core/MmlTree/MmlNode.js';


// AMS


export class AmsArrayItem extends ArrayItem {

  private numbered: boolean = false;
  private save: {[key: string]: string} = {};
  
  constructor(name: string, numbered: boolean, taggable: boolean, global: EnvList) {
    super();
    // Omitted configuration: && CONFIG.autoNumber !== "none";
    this.numbered = numbered;
    this.save['notags'] = global['notags'] as string;
    this.save['notag'] = global['notag'] as string;
    global['notags'] = (taggable ? null : name);
    // prevent automatic tagging in starred environments
    global['tagged'] = !numbered && !global['forcetag'];
  }

  get kind() {
    return 'AMSarray';
  }
  
  // TODO: Temporary!
  autoTag() {}
  getTag(): MmlNode {
    return;
  }
  clearTag() {}

  EndEntry() {
    TreeHelper.printMethod('AMS-EndEntry');
    // @test Cubic Binomial
    if (this.row.length) {
      ParserUtil.fixInitialMO(this.data);
    }
    const node = TreeHelper.createNode('mtd', this.data, {});
    // VS: OLD
    // var node = MML.mtd.apply(MML,this.data);
    this.row.push(node);
    this.data = [];
  }
  
  EndRow() {
    TreeHelper.printMethod('AMS-EndRow');
    // @test Cubic Binomial
    let mtr = 'mtr'; // MML.mtr;
    if (!this.global['tag'] && this.numbered) {
      this.autoTag();
    }
    if (this.global['tag'] && !this.global['notags']) {
      this.row = [this.getTag()].concat(this.row);
      mtr = 'mlabeledtr'; // MML.mlabeledtr;
    } else {
      this.clearTag();
    }
    if (this.numbered) {delete this.global['notag'];}
    const node = TreeHelper.createNode(mtr, this.row, {});
    this.table.push(node); this.row = [];
  }
  
  EndTable() {
    TreeHelper.printMethod('AMS-EndTable');
    // @test Cubic Binomial
    super.EndTable();
    this.global['notags'] = this.save['notags'];
    this.global['notag']  = this.save['notag'];
  }
}
