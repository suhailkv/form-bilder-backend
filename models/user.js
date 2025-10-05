module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "User",
    {
      userID: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
      },
      funnel_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      name: {
        type: DataTypes.STRING(60),
        allowNull: true,
      },
      jod: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      probation_completed_on: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      suggestion: {
        type: DataTypes.STRING(300),
        allowNull: true,
      },
      usertypeID: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
      },
      active: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
      pwd: {
        type: DataTypes.STRING(300),
        allowNull: false,
      },
      reporting_head: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      dob: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      bloodgroup: {
        type: DataTypes.STRING(10),
        allowNull: true,
      },
      sex: {
        type: DataTypes.STRING(10),
        allowNull: true,
      },
      marital_status: {
        type: DataTypes.STRING(10),
        allowNull: true,
      },
      email: {
        type: DataTypes.STRING(40),
        allowNull: true,
      },
      official_email_id: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      user_country_code: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 91,
      },
      phone: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      mob_hash: {
        type: DataTypes.STRING(300),
        allowNull: true,
      },
      a_phone: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      n_parent: {
        type: DataTypes.STRING(30),
        allowNull: true,
      },
      parent_mob: {
        type: DataTypes.STRING(10),
        allowNull: true,
      },
      pmt_h_name: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      pmt_street_area: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      pmt_city_town: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      pmt_post: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      pmt_pincode: {
        type: DataTypes.STRING(6),
        allowNull: true,
      },
      pmt_district: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      pmt_state: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      pmt_country: {
        type: DataTypes.STRING(100),
        allowNull: false,
        defaultValue: "INDIA",
      },
      pst_h_name: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      pst_street_area: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      pst_city_town: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      pst_post: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      pst_pincode: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      pst_district: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      pst_state: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      pst_country: {
        type: DataTypes.STRING(100),
        allowNull: false,
        defaultValue: "INDIA",
      },
      photo: {
        type: DataTypes.STRING(200),
        allowNull: true,
      },
      account_holder: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      account_no: {
        type: DataTypes.STRING(30),
        allowNull: true,
      },
      ifsc: {
        type: DataTypes.STRING(11),
        allowNull: true,
      },
      bank_name: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      bank_branch: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      upi_app: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      upi_mob_no: {
        type: DataTypes.STRING(10),
        allowNull: true,
      },
      bank_details_updated_on: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      aadhaar: {
        type: DataTypes.STRING(12),
        allowNull: true,
      },
      pan: {
        type: DataTypes.STRING(10),
        allowNull: true,
      },
      pf_number: {
        type: DataTypes.STRING(12),
        allowNull: true,
      },
      esic_number: {
        type: DataTypes.STRING(17),
        allowNull: true,
      },
      create_date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      modify_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      inactive_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      course_stream: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      course_status: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      year_of_pass: {
        type: DataTypes.STRING(4),
        allowNull: true,
      },
      academic_remarks: {
        type: DataTypes.STRING(300),
        allowNull: true,
      },
      completion: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      employment_type: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      employment_status: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
      leave_terms_accepted: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      emp_id: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      office_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      is_new_portal_registration: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      exit_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      exit_reason_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      transport_payment_verification: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: 0,
      },
    },
    {
      tableName: "user",
      timestamps: false, 
    }
  );

  return User;
};
