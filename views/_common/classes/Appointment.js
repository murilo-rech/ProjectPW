export default class Appointment {
    #id;
    #availabilityId;
    #studentId;
    #notes;
    #active;
    #status;
    #subjectName;
    #teacherName;
    #studentName;
    #weekday;
    #startTime;
    #endTime;
    #modality;
    #location;
    #meetingLink;
    #createdAt;
    #images;

    constructor(data = {}) {
        this.id = data.id ?? null;
        this.availabilityId = data.availability_id ?? null;
        this.studentId = data.student_id ?? null;
        this.notes = data.notes ?? "";
        this.active = data.active ?? 1;
        this.status = data.status ?? "pending";
        this.subjectName = data.subject_name ?? "";
        this.teacherName = data.teacher_name ?? "";
        this.studentName = data.student_name ?? "";
        this.weekday = data.weekday ?? null;
        this.startTime = data.start_time ?? "";
        this.endTime = data.end_time ?? "";
        this.modality = data.modality ?? null;
        this.location = data.location ?? "";
        this.meetingLink = data.meeting_link ?? "";
        this.createdAt = data.created_at ?? null;
        this.images = data.images ?? [];
    }

    get id() { return this.#id; }
    set id(value) { this.#id = value == null ? null : Number(value); }
    get availabilityId() { return this.#availabilityId; }
    set availabilityId(value) { this.#availabilityId = value == null ? null : Number(value); }
    get studentId() { return this.#studentId; }
    set studentId(value) { this.#studentId = value == null ? null : Number(value); }
    get notes() { return this.#notes; }
    set notes(value) { this.#notes = String(value ?? "").trim(); }
    get active() { return this.#active; }
    set active(value) { this.#active = Number(value) === 0 ? 0 : 1; }
    get status() { return this.#status; }
    set status(value) {
        const allowed = ["pending", "approved", "rejected", "completed", "cancelled"];
        if (!allowed.includes(value)) throw new TypeError("Status de agendamento invalido.");
        this.#status = value;
    }
    get subjectName() { return this.#subjectName; }
    set subjectName(value) { this.#subjectName = String(value ?? ""); }
    get teacherName() { return this.#teacherName; }
    set teacherName(value) { this.#teacherName = String(value ?? ""); }
    get studentName() { return this.#studentName; }
    set studentName(value) { this.#studentName = String(value ?? ""); }
    get weekday() { return this.#weekday; }
    set weekday(value) { this.#weekday = value == null ? null : Number(value); }
    get startTime() { return this.#startTime; }
    set startTime(value) { this.#startTime = String(value ?? ""); }
    get endTime() { return this.#endTime; }
    set endTime(value) { this.#endTime = String(value ?? ""); }
    get modality() { return this.#modality; }
    set modality(value) { this.#modality = value == null ? null : Number(value); }
    get location() { return this.#location; }
    set location(value) { this.#location = String(value ?? ""); }
    get meetingLink() { return this.#meetingLink; }
    set meetingLink(value) { this.#meetingLink = String(value ?? ""); }
    get createdAt() { return this.#createdAt; }
    set createdAt(value) { this.#createdAt = value ?? null; }
    get images() { return this.#images; }
    set images(value) { this.#images = Array.isArray(value) ? value : []; }

    static fromAPI(data) { return new Appointment(data); }

    toPayload() {
        return { availability_id: this.availabilityId, notes: this.notes };
    }
}
