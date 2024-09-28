/*
 * MIT License
 * 
 * Copyright (c) 2024 Erik Michelson (https://github.com/ErikMichelson)
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
const args = Bun.argv;

type AgeGroup = string;
type DisciplineId = string;
type GroupId = string;
type Level = 'Bronze' | 'Silver' | 'Gold';
type Gender = 'w' | 'm';
type Value = string | number | undefined;
type Result = Record<Level, Value>;
type AgeGroupResults = Record<AgeGroup, Result>;
type Discipline = {
    id: DisciplineId;
    name: string;
    group: string;
    unit: string;
    unit_original: string;
    values: Record<Gender, AgeGroupResults>;
};
type Group = {
    id: string;
    name: string;
    disciplines: Record<DisciplineId, Discipline>;
};
type Data = Record<GroupId, Group>;



if (args.length < 4) {
  console.error(`Usage: ${args[1]} <input_w.csv> <input_m.csv>`);
  process.exit(1);
}

const srcFileW = args[2];
const srcFileM = args[3];

const genericFileName = srcFileW.replace(/\_W.csv$/i, '');

const result: Data = {};

const transformValue = (value: string): Value => {
    if (value === '') {
        return undefined;
    }

    if (value.includes(':')) {
        const parts = value.split(':');
        if (parts.length !== 2) {
            console.warn('Invalid time format:', value);
            return undefined;
        }
        const minutes = Number.parseInt(parts[0], 10);
        const seconds = Number.parseFloat(parts[1].replace(',', '.'));
        if (Number.isNaN(minutes) || Number.isNaN(seconds)) {
            console.warn('Invalid time format:', value);
            return undefined;
        }
        return minutes * 60 + seconds;
    }

    const withoutComma = value.replace(',', '.');
    const asNumber = Number.parseFloat(withoutComma);

    return Number.isNaN(asNumber) ? value : asNumber;
};


const parseCsv = async (fileName: string, as: Gender) => {
    const file = Bun.file(fileName);
    const contents = await file.text();
    const lines = contents.split('\n');

    if (lines.length < 2) {
        console.error('Invalid CSV file (header):', fileName);
        process.exit(1);
    }

    // Detect age groups and levels
    const firstLine = lines[0].split(';');
    const secondLine = lines[1].split(';');
    firstLine.splice(0, 6);
    secondLine.splice(0, 6);

    const fieldsToAgeAndLevel = [];

    for (let i = 0; i < firstLine.length; i++) {
        const ageGroup = firstLine[i];
        const level = secondLine[i];
        fieldsToAgeAndLevel.push({ ageGroup, level });
    }

    // Parse data
    for (let i = 2; i < lines.length; i++) {
        const line = lines[i];
        if (line === '') {
            continue;
        }
        const cells = line.split(';');
        const id = cells[0];
        const unit_original = cells[1];
        const unit = cells[2];
        const group = cells[3];
        const group_name = cells[4];
        const name = cells[5];
        cells.splice(0, 6);

        if (cells.length !== fieldsToAgeAndLevel.length) {
            console.error('Invalid CSV file (field count):', fileName, cells.length, fieldsToAgeAndLevel.length);
            process.exit(1);
        }

        if (!result[group]) {
            result[group] = {
                id: group,
                name: group_name,
                disciplines: {}
            };
        }

        if (!result[group].disciplines[id]) {
            result[group].disciplines[id] = {
                id,
                name,
                group,
                unit,
                unit_original,
                values: {
                    w: {},
                    m: {}
                }
            };
        }

        for (let j = 0; j < cells.length; j++) {
            const fieldMeta = fieldsToAgeAndLevel[j];
            if (fieldMeta.level !== 'Bronze' && fieldMeta.level !== 'Silver' && fieldMeta.level !== 'Gold') {
                console.error('Invalid CSV file (levels):', fileName);
                process.exit(1);
            }
            const ageGroup = fieldMeta.ageGroup as AgeGroup;
            const level = fieldMeta.level as Level;
            const value = transformValue(cells[j]);
            if (value === undefined) {
                continue;
            }
            if (!result[group].disciplines[id].values[as][ageGroup]) {
                result[group].disciplines[id].values[as][ageGroup] = {
                    Bronze: undefined,
                    Silver: undefined,
                    Gold: undefined
                };
            }
            result[group].disciplines[id].values[as][ageGroup][level] = value;
        }
    }
};

const jobs = [
    parseCsv(srcFileW, 'w'),
    parseCsv(srcFileM, 'm')
];
Promise.all(jobs).then(() => {
    const json = JSON.stringify(result, null, 2);
    return Bun.write(`${genericFileName}.json`, json);
}).then(() =>{
    console.log(`Written output to file: ${genericFileName}.json`);
    process.exit(0);
}).catch((e) => {
    console.error(e);
    process.exit(1);
});
