export default class Availability {
    #id;
    #teacherId;
    #subjectId;
    #subjectName;
    #teacherName;
    #modality;
    #weekday;
    #startTime;
    #endTime;
    #maxStudents;
    #bookedStudents;
    #location;
    #meetingLink;
    #active;

    constructor(data = {}) {
        this.id = data.id ?? null;
        this.teacherId = data.teacher_id ?? null;
        this.subjectId = data.subject_id ?? null;
        this.subjectName = data.subject_name ?? "";
        this.teacherName = data.teacher_name ?? "";
        this.modality = data.modality ?? null;
        this.weekday = data.weekday ?? null;
        this.startTime = data.start_time ?? "";
        this.endTime = data.end_time ?? "";
        this.maxStudents = data.max_students ?? 0;
        this.bookedStudents = data.booked_students ?? 0;
        this.location = data.location ?? "";
        this.meetingLink = data.meeting_link ?? "";
        this.active = data.active ?? 1;
    }

    get id() { return this.#id; }
    set id(value) { this.#id = value == null ? null : Number(value); }
    get teacherId() { return this.#teacherId; }
    set teacherId(value) { this.#teacherId = value == null ? null : Number(value); }
    get subjectId() { return this.#subjectId; }
    set subjectId(value) { this.#subjectId = value == null ? null : Number(value); }
    get subjectName() { return this.#subjectName; }
    set subjectName(value) { this.#subjectName = String(value ?? ""); }
    get teacherName() { return this.#teacherName; }
    set teacherName(value) { this.#teacherName = String(value ?? ""); }
    get modality() { return this.#modality; }
    set modality(value) { this.#modality = value == null ? null : Number(value); }
    get weekday() { return this.#weekday; }
    set weekday(value) { this.#weekday = value == null ? null : Number(value); }
    get startTime() { return this.#startTime; }
    set startTime(value) { this.#startTime = String(value ?? ""); }
    get endTime() { return this.#endTime; }
    set endTime(value) { this.#endTime = String(value ?? ""); }
    get maxStudents() { return this.#maxStudents; }
    set maxStudents(value) { this.#maxStudents = Number(value) || 0; }
    get bookedStudents() { return this.#bookedStudents; }
    set bookedStudents(value) { this.#bookedStudents = Number(value) || 0; }
    get location() { return this.#location; }
    set location(value) { this.#location = String(value ?? ""); }
    get meetingLink() { return this.#meetingLink; }
    set meetingLink(value) { this.#meetingLink = String(value ?? ""); }
    get active() { return this.#active; }
    set active(value) { this.#active = Number(value) === 0 ? 0 : 1; }

    static fromAPI(data) { return new Availability(data); }

    toPayload() {
        const online = this.modality === 1;
        return {
            subject_id: this.subjectId,
            modality: this.modality,
            weekday: this.weekday,
            start_time: this.startTime,
            end_time: this.endTime,
            max_students: this.maxStudents,
            location: online ? "" : this.location,
            meeting_link: online ? this.meetingLink : ""
        };
    }
}
