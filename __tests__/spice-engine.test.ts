import {
  calculateSpiceIncorporation,
  calculateStateStampDuty,
  STATE_STAMP_RULES,
  POST_INCORPORATION_CHECKLIST,
  formatInr
} from '../lib/rule-engine/spice-engine';

describe('SPICe+ (INC-32) Company Incorporation Rule Engine', () => {
  describe('1. MCA Zero-Fee Exemption under G.S.R. 329(E)', () => {
    test('Grants NIL MCA fee for Private Limited with capital <= ₹15 Lakhs', () => {
      const result = calculateSpiceIncorporation({
        capital: 1000000,
        stateKey: 'delhi',
        companyType: 'private_standard',
        directorCount: 2,
        reserveNameSeparately: false
      });

      expect(result.mcaFee).toBe(0);
      expect(result.isMcaFeeZero).toBe(true);
      expect(result.mcaFeeSaved).toBe(36000);
      expect(result.panFee).toBe(78);
      expect(result.tanFee).toBe(77);
      expect(result.moaDuty).toBe(200);
      expect(result.aoaDuty).toBe(1500);
      expect(result.formDuty).toBe(10);
      expect(result.totalGovernmentPayable).toBe(0 + 200 + 1500 + 10 + 78 + 77);
    });

    test('Grants NIL MCA fee exactly at ₹15 Lakhs threshold', () => {
      const result = calculateSpiceIncorporation({
        capital: 1500000,
        stateKey: 'maharashtra',
        companyType: 'private_standard',
        directorCount: 2,
        reserveNameSeparately: false
      });

      expect(result.mcaFee).toBe(0);
      expect(result.isMcaFeeZero).toBe(true);
      expect(result.mcaFeeSaved).toBe(51000);
    });

    test('Levies Table A progressive registration fee when capital > ₹15 Lakhs', () => {
      const result = calculateSpiceIncorporation({
        capital: 2000000,
        stateKey: 'delhi',
        companyType: 'private_standard',
        directorCount: 2,
        reserveNameSeparately: false
      });

      expect(result.mcaFee).toBeGreaterThan(0);
      expect(result.isMcaFeeZero).toBe(false);
      expect(result.mcaFeeSaved).toBe(0);
      expect(result.mcaFee).toBe(66000);
    });

    test('Applies OPC / Small Company statutory rate when applicable', () => {
      const result = calculateSpiceIncorporation({
        capital: 100000,
        stateKey: 'uttar_pradesh',
        companyType: 'one_person_company',
        directorCount: 1,
        reserveNameSeparately: false
      });

      expect(result.mcaFee).toBe(0);
      expect(result.isMcaFeeZero).toBe(true);
      expect(result.moaDuty).toBe(500);
      expect(result.aoaDuty).toBe(500);
      expect(result.formDuty).toBe(10);
      expect(result.totalGovernmentPayable).toBe(0 + 500 + 500 + 10 + 78 + 77);
    });
  });

  describe('2. State-Wise Stamp Duty Calculations across Key States', () => {
    test('Calculates Maharashtra stamp duty (0.3% / ₹1,000 per ₹5L with ₹1 Cr cap)', () => {
      const duty10L = calculateStateStampDuty('maharashtra', 1000000, 'private_standard');
      expect(duty10L.moaDuty).toBe(1000);
      expect(duty10L.aoaDuty).toBe(3000); // 0.3% of 10L = 3,000
      expect(duty10L.formDuty).toBe(100);
      expect(duty10L.totalStampDuty).toBe(4100);

      const dutyHuge = calculateStateStampDuty('maharashtra', 5000000000, 'private_standard');
      expect(dutyHuge.aoaDuty).toBe(10000000); // Capped at ₹1 Crore
    });

    test('Calculates Karnataka 2024 revised stamp duty (₹5,000 per ₹10L on AOA)', () => {
      const duty10L = calculateStateStampDuty('karnataka', 1000000, 'private_standard');
      expect(duty10L.moaDuty).toBe(1000);
      expect(duty10L.aoaDuty).toBe(5000); // Karnataka Stamp Amendment Act 2024
      expect(duty10L.formDuty).toBe(20);
      expect(duty10L.totalStampDuty).toBe(6020);

      const duty25L = calculateStateStampDuty('karnataka', 2500000, 'private_standard');
      // 25L / 10L = ceil(2.5) = 3 slabs * 5000 = 15,000
      expect(duty25L.aoaDuty).toBe(15000);
    });

    test('Calculates Tamil Nadu 2024 revised stamp duty (₹500 per ₹10L, cap ₹5L)', () => {
      const duty10L = calculateStateStampDuty('tamil_nadu', 1000000, 'private_standard');
      expect(duty10L.moaDuty).toBe(200); // TN flat MOA
      expect(duty10L.aoaDuty).toBe(500); // ₹500 per 10L
      expect(duty10L.formDuty).toBe(20);
      expect(duty10L.totalStampDuty).toBe(720);
    });

    test('Calculates Punjab high base duty (MOA ₹5,000 + AOA ₹10,000)', () => {
      const duty10L = calculateStateStampDuty('punjab', 1000000, 'private_standard');
      expect(duty10L.moaDuty).toBe(5000);
      expect(duty10L.aoaDuty).toBe(10000); // > 1L capital slab
      expect(duty10L.formDuty).toBe(25);
      expect(duty10L.totalStampDuty).toBe(15025);
    });

    test('Calculates Haryana ultra low flat duty', () => {
      const duty10L = calculateStateStampDuty('haryana', 1000000, 'private_standard');
      expect(duty10L.moaDuty).toBe(60);
      expect(duty10L.aoaDuty).toBe(120); // > 1L capital slab
      expect(duty10L.formDuty).toBe(15);
      expect(duty10L.totalStampDuty).toBe(195);
    });

    test('Applies Section 8 exemption in exempt states', () => {
      const dutyDelhi = calculateStateStampDuty('delhi', 1000000, 'section_8');
      expect(dutyDelhi.moaDuty).toBe(0);
      expect(dutyDelhi.aoaDuty).toBe(0);
      expect(dutyDelhi.isExempt).toBe(true);

      const dutyMH = calculateStateStampDuty('maharashtra', 1000000, 'section_8');
      expect(dutyMH.moaDuty).toBe(0);
      expect(dutyMH.aoaDuty).toBe(0);
      expect(dutyMH.isExempt).toBe(true);
    });
  });

  describe('3. Director DIN Allocation & Name Reservation Rules', () => {
    test('Allocates up to 3 DINs at ₹0 additional government fee', () => {
      const result = calculateSpiceIncorporation({
        capital: 1000000,
        stateKey: 'delhi',
        companyType: 'private_standard',
        directorCount: 3,
        reserveNameSeparately: false
      });

      expect(result.freeDinsAllotted).toBe(3);
      expect(result.paidDinsCount).toBe(0);
      expect(result.dinAllotmentFee).toBe(0);
    });

    test('Levies DIR-3 fee of ₹500 per director for directors beyond 3', () => {
      const result = calculateSpiceIncorporation({
        capital: 1000000,
        stateKey: 'delhi',
        companyType: 'private_standard',
        directorCount: 5,
        reserveNameSeparately: false
      });

      expect(result.freeDinsAllotted).toBe(3);
      expect(result.paidDinsCount).toBe(2);
      expect(result.dinAllotmentFee).toBe(1000);
    });

    test('Accounts for separate Part A name reservation fee of ₹1,000', () => {
      const resultBundled = calculateSpiceIncorporation({
        capital: 1000000,
        stateKey: 'delhi',
        companyType: 'private_standard',
        directorCount: 2,
        reserveNameSeparately: false
      });
      expect(resultBundled.nameReservationFee).toBe(0);

      const resultSeparate = calculateSpiceIncorporation({
        capital: 1000000,
        stateKey: 'delhi',
        companyType: 'private_standard',
        directorCount: 2,
        reserveNameSeparately: true
      });
      expect(resultSeparate.nameReservationFee).toBe(1000);
      expect(resultSeparate.totalGovernmentPayable).toBe(resultBundled.totalGovernmentPayable + 1000);
    });
  });

  describe('4. All 36 States/UTs Coverage & Post-Incorporation Checklist', () => {
    test('Registry contains exactly 36 States and Union Territories', () => {
      const stateKeys = Object.keys(STATE_STAMP_RULES);
      expect(stateKeys.length).toBe(36);
    });

    test('Regional benchmark table compares top commercial states', () => {
      const result = calculateSpiceIncorporation({
        capital: 1000000,
        stateKey: 'delhi',
        companyType: 'private_standard',
        directorCount: 2,
        reserveNameSeparately: false
      });

      expect(result.benchmarks.length).toBeGreaterThanOrEqual(8);
      const karnatakaBenchmark = result.benchmarks.find(b => b.stateKey === 'karnataka');
      expect(karnatakaBenchmark).toBeDefined();
      expect(karnatakaBenchmark?.totalEstimate).toBe(6175);
    });

    test('Checklist includes 180-day INC-20A and 30-day ADT-1 statutory milestones', () => {
      const inc20aItem = POST_INCORPORATION_CHECKLIST.find(item => item.id === 'inc20a');
      expect(inc20aItem).toBeDefined();
      expect(inc20aItem?.daysFromIncorporation).toBe(180);
      expect(inc20aItem?.section).toContain('10A');

      const adt1Item = POST_INCORPORATION_CHECKLIST.find(item => item.id === 'adt1');
      expect(adt1Item).toBeDefined();
      expect(adt1Item?.daysFromIncorporation).toBe(30);
      expect(adt1Item?.section).toContain('139(6)');
    });
  });
});
