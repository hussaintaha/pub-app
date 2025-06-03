import mongoose from 'mongoose';

const scriptSchema = new mongoose.Schema({
    script:{
        type: String,
        required: true,
    },
    shop:{
        type: String,
        required: true,
    }
},{
    timestamps: true,
    versionKey: false
});

const Script = mongoose.models.Script || mongoose.model('Script', scriptSchema);

export default Script;
